import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { BaseParseService } from './base-parse.service';
import { IAiParseService, AiParseResult } from './ai-parse.interface';

@Injectable()
export class ClaudeParseService extends BaseParseService implements IAiParseService {
  private readonly client: Anthropic;

  constructor(private configService: ConfigService) {
    super('ClaudeParseService');
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async parseWithAI(csvText: string): Promise<AiParseResult> {
    const model = this.configService.get<string>('AI_MODEL') || 'claude-haiku-4-5-20251001';
    const maxTokens = this.configService.get<number>('AI_MAX_TOKENS') || 32000;
    const skill = this.getSkillContent();

    this.logger.log(`Calling Claude API (model: ${model}, csv: ${csvText.length} chars)`);
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

    this.logger.log(`Claude API responded in ${Date.now() - startTime}ms`);

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new InternalServerErrorException('Claude API returned no text content');
    }

    const tokensUsed =
      (response.usage?.input_tokens || 0) +
      (response.usage?.output_tokens || 0);

    const result = this.extractJson(textBlock.text);

    return { result, tokensUsed, model };
  }
}
