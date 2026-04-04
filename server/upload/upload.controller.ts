import {
  Controller,
  Post,
  Get,
  Inject,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { AI_PARSE_SERVICE, IAiParseService } from '@server/upload/services/ai-parse.interface';
import { ImportService } from '@server/upload/services/import.service';
import { Statement, Upload } from '@server/database/entities';
import { CurrentUser } from '@server/auth/decorators/current-user.decorator';
import { ImportResultDto } from '@server/upload/dto/import-result.dto';
import { hashFile } from '@common/utils/hash.util';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(
    @Inject(AI_PARSE_SERVICE) private parseService: IAiParseService,
    private importService: ImportService,
    private configService: ConfigService,
    @InjectRepository(Upload)
    private uploadRepo: Repository<Upload>,
    @InjectRepository(Statement)
    private statementRepo: Repository<Statement>,
  ) {}

  @Post('csv')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = process.env.UPLOAD_DIR || './data/uploads';
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          const ext = path.extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only CSV files are accepted'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB default
      },
    }),
  )
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() userId: number,
  ): Promise<ImportResultDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const startTime = Date.now();
    this.logger.log(`Upload received: ${file.originalname} (${file.size} bytes)`);

    // 1. Compute file hash
    const fileHash = hashFile(file.path);

    // 2. Check for duplicate
    const existingStatement = await this.statementRepo.findOne({
      where: { userId, fileHash },
    });
    if (existingStatement) {
      // Log as duplicate
      await this.uploadRepo.save(
        this.uploadRepo.create({
          userId,
          filename: file.originalname,
          fileHash,
          status: 'duplicate',
          statementId: existingStatement.id,
        }),
      );

      return {
        status: 'duplicate',
        statementId: existingStatement.id,
        period: {
          from: existingStatement.periodFrom,
          to: existingStatement.periodTo,
        },
      };
    }

    // 3. Create processing upload record
    const upload = await this.uploadRepo.save(
      this.uploadRepo.create({
        userId,
        filename: file.originalname,
        fileHash,
        status: 'processing',
      }),
    );

    try {
      // 4. Decode CSV
      const csvText = this.parseService.decodeFile(file.path);

      // 5. Parse with AI
      const { result, tokensUsed, model } = await this.parseService.parseWithAI(csvText);

      // 6. Import into database
      const stats = await this.importService.import(result, userId, fileHash, file.originalname);

      const processingMs = Date.now() - startTime;

      // 7. Update upload record
      upload.status = 'success';
      upload.statementId = stats.statementId;
      upload.txnCount = stats.transactionsImported;
      upload.aiTokensUsed = tokensUsed;
      upload.aiModel = model;
      upload.processingMs = processingMs;
      await this.uploadRepo.save(upload);

      this.logger.log(
        `Upload complete in ${processingMs}ms: ${stats.transactionsImported} txns, ${tokensUsed} tokens`,
      );

      return {
        status: 'success',
        statementId: stats.statementId,
        period: {
          from: result.statement.period.from,
          to: result.statement.period.to,
        },
        transactionsImported: stats.transactionsImported,
        transactionsSkipped: stats.transactionsSkipped,
        newMerchants: stats.newMerchants,
        aiTokensUsed: tokensUsed,
        aiModel: model,
        processingMs,
      };
    } catch (err) {
      // Update upload record with error
      upload.status = 'error';
      upload.errorMessage = err.message;
      upload.processingMs = Date.now() - startTime;
      await this.uploadRepo.save(upload);

      this.logger.error(`Upload failed: ${err.message}`);
      throw new InternalServerErrorException(`Import failed: ${err.message}`);
    }
  }

  @Get('uploads')
  async listUploads(@CurrentUser() userId: number) {
    return this.uploadRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
