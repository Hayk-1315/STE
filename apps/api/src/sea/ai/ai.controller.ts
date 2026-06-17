// apps/api/src/sea/ai/ai.controller.ts
// SEA AI Assist (Phase 1A) — thin, stateless REST surface.
// POST /sea/ai/parse returns an in-band discriminated status
// (validDraft | needsClarification | unsupportedIntent | aiUnavailable).
// It never creates or mutates an intent; the existing signed create flow
// remains the only path to an intent.
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { aiSeaParseRequestSchema } from './ai-draft.schema';
import { AiParserService } from './ai-parser.service';

@Controller('sea/ai')
export class AiController {
  constructor(private readonly parser: AiParserService) {}

  @Post('parse')
  async parse(@Body() body: unknown) {
    const parsed = aiSeaParseRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'invalid_payload',
        issues: parsed.error.issues,
      });
    }
    return this.parser.parse(parsed.data);
  }
}
