import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { BaseParseService } from './base-parse.service';
import { IAiParseService, AiParseResult } from './ai-parse.interface';

@Injectable()
export class GeminiParseService extends BaseParseService implements IAiParseService {
  private readonly client: GoogleGenAI;
  private readonly model: string;
  private readonly fallbackModels = [
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
  ];

  constructor(private configService: ConfigService) {
    super('GeminiParseService');
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.client = new GoogleGenAI({ apiKey });
    this.model = this.configService.get<string>('AI_MODEL') || 'gemini-2.5-flash';
  }

  async parseWithAI(csvText: string): Promise<AiParseResult> {
    const skill = this.getSkillContent();
    const maxTokens = this.configService.get<number>('AI_MAX_TOKENS') || 16000;

    const modelsToTry = [this.model, ...this.fallbackModels.filter((m) => m !== this.model)];

    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];

      if (i > 0) {
        this.logger.warn(`Falling back to model: ${model}`);
      }

      try {
        return await this.callGemini(model, csvText, skill, maxTokens);
      } catch (err: any) {
        console.log(err);
        const isUnavailable = err.message?.includes('503') || err.message?.includes('UNAVAILABLE');
        const isLast = i === modelsToTry.length - 1;

        if (isUnavailable && !isLast) {
          this.logger.warn(`Model ${model} unavailable, trying next fallback...`);
          continue;
        }

        const cause = err.cause ? ` (cause: ${err.cause?.message || err.cause})` : '';
        this.logger.error(`Gemini API call failed: ${err.message}${cause}`);
        throw new InternalServerErrorException(`AI parsing failed: ${err.message}${cause}`);
      }
    }

    throw new InternalServerErrorException('All Gemini models unavailable');
  }

  private async callGemini(
    model: string,
    csvText: string,
    skill: string,
    maxTokens: number,
  ): Promise<AiParseResult> {
    this.logger.log(`Calling Gemini API (model: ${model}, csv: ${csvText.length} chars)`);
    const startTime = Date.now();

    const response = await this.client.models.generateContent({
      model,
      contents: `Parse this bank statement:\n\n${csvText}`,
      config: {
        systemInstruction: skill,
        temperature: 0,
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json',
      },
    });

    this.logger.log(`Gemini API responded in ${Date.now() - startTime}ms`);

    const rawText = response.text;
    if (!rawText) {
      this.logger.error('Gemini returned no content');
      throw new InternalServerErrorException('Gemini API returned no content');
    }

    const usage = response.usageMetadata;
    const tokensUsed = (usage?.promptTokenCount || 0) + (usage?.candidatesTokenCount || 0);

    const result = this.extractJson(rawText);

    return { result, tokensUsed, model };
  }
}
