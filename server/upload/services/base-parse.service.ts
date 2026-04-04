import { Logger, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { decodeBuffer } from '../../common/utils/encoding.util';
import { ParseResult, validateParseResult } from '../dto/parse-result.dto';

/**
 * Shared logic for all AI parse services:
 * - SKILL.md loading and caching
 * - CSV file decoding
 * - JSON extraction from AI response text
 * - Response validation
 */
export abstract class BaseParseService {
  protected readonly logger: Logger;
  private skillContent: string | null = null;

  constructor(loggerContext: string) {
    this.logger = new Logger(loggerContext);
  }

  /**
   * Load the SKILL.md content (cached after first read).
   */
  protected getSkillContent(): string {
    if (this.skillContent) return this.skillContent;

    const skillPath = path.join(__dirname, '..', 'skills', 'bank-csv-parser', 'SKILL.md');

    const fallbackPath = path.join(
      process.cwd(),
      'server',
      'upload',
      'skills',
      'bank-csv-parser',
      'SKILL.md',
    );

    const resolvedPath = fs.existsSync(skillPath) ? skillPath : fallbackPath;

    if (!fs.existsSync(resolvedPath)) {
      throw new InternalServerErrorException(
        `SKILL.md not found at ${skillPath} or ${fallbackPath}`,
      );
    }

    this.skillContent = fs.readFileSync(resolvedPath, 'utf-8');
    this.logger.log(`Loaded SKILL.md (${this.skillContent.length} chars)`);
    return this.skillContent;
  }

  /**
   * Decode an uploaded CSV file from Windows-1251 (or other encoding) to UTF-8.
   */
  decodeFile(filePath: string, encoding: string = 'windows-1251'): string {
    const buffer = fs.readFileSync(filePath);
    return decodeBuffer(buffer, encoding);
  }

  /**
   * Extract JSON from AI response text.
   * Handles responses wrapped in ```json ... ``` fences.
   */
  protected extractJson(rawText: string): ParseResult {
    let jsonStr = rawText.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (err: any) {
      this.logger.error(`Failed to parse AI JSON response: ${err.message}`);
      this.logger.debug(`Raw response (first 500 chars): ${rawText.substring(0, 500)}`);

      // Save failed response for debugging
      const errorDir = path.join(process.cwd(), 'data', 'error_logs');
      if (!fs.existsSync(errorDir)) fs.mkdirSync(errorDir, { recursive: true });
      const errorFile = path.join(errorDir, `parse_error_${Date.now()}.txt`);
      fs.writeFileSync(errorFile, rawText);
      this.logger.log(`Saved failed response to ${errorFile}`);

      throw new InternalServerErrorException(
        'AI returned invalid JSON. Response saved for debugging.',
      );
    }

    // Validate structure
    const validationErrors = validateParseResult(parsed);
    if (validationErrors.length > 0) {
      this.logger.error(`Parse result validation failed: ${validationErrors.join('; ')}`);
      throw new InternalServerErrorException(
        `AI response validation failed: ${validationErrors.join('; ')}`,
      );
    }

    return parsed as ParseResult;
  }
}
