import { ParseResult } from '../dto/parse-result.dto';

export interface AiParseResult {
  result: ParseResult;
  tokensUsed: number;
  model: string;
}

/**
 * Interface for AI-powered bank statement parsing.
 * Both Claude and Gemini services implement this.
 */
export interface IAiParseService {
  /**
   * Decode an uploaded CSV file from the given encoding to UTF-8.
   */
  decodeFile(filePath: string, encoding?: string): string;

  /**
   * Send decoded CSV text to the AI provider with the bank-csv-parser skill.
   * Returns structured ParseResult, token usage, and model name.
   */
  parseWithAI(csvText: string): Promise<AiParseResult>;
}

/**
 * NestJS DI token for the AI parse service.
 * The upload module provides the correct implementation based on AI_PROVIDER config.
 */
export const AI_PARSE_SERVICE = Symbol('AI_PARSE_SERVICE');
