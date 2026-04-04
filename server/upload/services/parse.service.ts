import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { decodeBuffer } from '../../common/utils/encoding.util';
import { ParseResult, validateParseResult } from '../dto/parse-result.dto';

@Injectable()
export class ParseService {
  private readonly logger = new Logger(ParseService.name);
  private readonly client: Anthropic;
  private skillContent: string | null = null;

  constructor(private configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  /**
   * Load the SKILL.md content (cached after first read).
   */
  private getSkillContent(): string {
    if (this.skillContent) return this.skillContent;

    const skillPath = path.join(__dirname, '..', 'skills', 'bank-csv-parser', 'SKILL.md');

    // Fallback: try relative to project root (dev mode)
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
   * Decode an uploaded CSV file from Windows-1251 to UTF-8.
   */
  decodeFile(filePath: string, encoding: string = 'windows-1251'): string {
    const buffer = fs.readFileSync(filePath);
    return decodeBuffer(buffer, encoding);
  }

  /**
   * Send the decoded CSV text to Claude API with the bank-csv-parser skill.
   * Returns the parsed JSON result and token usage.
   */
  async parseWithAI(
    csvText: string,
  ): Promise<{ result: ParseResult; tokensUsed: number; model: string }> {
    const model = this.configService.get<string>('AI_MODEL') || 'claude-haiku-4-5-20251001';
    const maxTokens = this.configService.get<number>('AI_MAX_TOKENS') || 16000;
    const skill = this.getSkillContent();

    this.logger.log(`Calling Claude API (model: ${model}, csv length: ${csvText.length})`);

    const startTime = Date.now();

    let response: Anthropic.Message;
    try {
      response = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature: 0,
        system: skill,
        messages: [
          {
            role: 'user',
            content: `Parse this bank statement:\n\n${csvText}`,
          },
        ],
      });
    } catch (err: any) {
      this.logger.error(`Claude API call failed: ${err.message}`);
      throw new InternalServerErrorException(`AI parsing failed: ${err.message}`);
    }

    const elapsed = Date.now() - startTime;
    this.logger.log(`Claude API responded in ${elapsed}ms`);

    // Extract text content from response
    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new InternalServerErrorException('Claude API returned no text content');
    }

    const rawText = textBlock.text.trim();
    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    // Extract JSON from response (may be wrapped in ```json ... ```)
    let jsonStr = rawText;
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    // Parse JSON
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

    return {
      result: parsed as ParseResult,
      tokensUsed,
      model,
    };
  }
}
