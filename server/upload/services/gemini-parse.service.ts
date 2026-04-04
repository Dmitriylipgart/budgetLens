import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseParseService } from './base-parse.service';
import { IAiParseService, AiParseResult } from './ai-parse.interface';

/**
 * Gemini AI parse service using Google's Generative AI REST API.
 * No SDK dependency — uses native fetch for zero-cost free tier access.
 */
@Injectable()
export class GeminiParseService extends BaseParseService implements IAiParseService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  private readonly fallbackModels = [
    'gemini-3.0-flash',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
  ];

  constructor(private configService: ConfigService) {
    super('GeminiParseService');
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.model = this.configService.get<string>('AI_MODEL') || 'gemini-2.0-flash';
  }

  async parseWithAI(csvText: string): Promise<AiParseResult> {
    const skill = this.getSkillContent();
    const maxTokens = this.configService.get<number>('AI_MAX_TOKENS') || 16000;

    const modelsToTry = [this.model, ...this.fallbackModels];

    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];
      const isFallback = i > 0;

      if (isFallback) {
        this.logger.warn(`Falling back to model: ${model}`);
      }

      try {
        return await this.callGemini(model, csvText, skill, maxTokens);
      } catch (err: any) {
        const isUnavailable = err.message?.includes('503') || err.message?.includes('UNAVAILABLE');
        const isLast = i === modelsToTry.length - 1;

        if (isUnavailable && !isLast) {
          this.logger.warn(`Model ${model} unavailable, trying next fallback...`);
          continue;
        }

        this.logger.error(`Gemini API call failed: ${err.message}`);
        throw new InternalServerErrorException(`AI parsing failed: ${err.message}`);
      }
    }

    // Should never reach here
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

    const url = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      systemInstruction: {
        parts: [{ text: skill }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: `Parse this bank statement:\n\n${csvText}` }],
        },
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json',
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    const responseData = await response.json();

    this.logger.log(`Gemini API responded in ${Date.now() - startTime}ms`);

    const candidate = responseData.candidates?.[0];
    if (!candidate?.content?.parts?.length) {
      this.logger.error('Gemini returned no content');
      this.logger.debug(`Response: ${JSON.stringify(responseData).substring(0, 500)}`);
      throw new InternalServerErrorException('Gemini API returned no content');
    }

    const rawText = candidate.content.parts.map((p: any) => p.text || '').join('');

    const usage = responseData.usageMetadata;
    const tokensUsed = (usage?.promptTokenCount || 0) + (usage?.candidatesTokenCount || 0);

    const result = this.extractJson(rawText);

    return { result, tokensUsed, model };
  }
}
