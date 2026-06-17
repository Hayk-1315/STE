// apps/api/src/sea/ai/provider/anthropic.provider.ts
// Anthropic adapter for the SEA AI extractor. Server-side only. Reads
// ANTHROPIC_API_KEY from the environment (never the frontend). Requests
// JSON-only output and returns the parsed object (unknown) for the parser
// service to validate. Throws on any failure (missing key, network, malformed)
// so the service maps it to a safe `aiUnavailable`. Never logs the key,
// prompts, or raw completions.
import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import type {
  AiIntentParseInput,
  AiIntentProvider,
} from './ai-provider.interface';
import { buildSystemPrompt, buildUserPrompt } from '../prompt';

const DEFAULT_MODEL = 'claude-haiku-4-5';
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_TOKENS = 512;

@Injectable()
export class AnthropicIntentProvider implements AiIntentProvider {
  readonly name = 'anthropic';
  private client: Anthropic | null = null;
  private clientKey: string | null = null;

  async parse(input: AiIntentParseInput): Promise<unknown> {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      // Surfaced as aiUnavailable by the caller. No content logged.
      throw new Error('anthropic_api_key_missing');
    }
    const model = process.env.SEA_AI_MODEL?.trim() || DEFAULT_MODEL;
    const client = this.getClient(apiKey);

    const message = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      // Deterministic extraction: minimize paraphrasing/scaling variance.
      temperature: 0,
      system: buildSystemPrompt(input),
      messages: [{ role: 'user', content: buildUserPrompt(input) }],
    });

    let text = '';
    for (const block of message.content) {
      if (block.type === 'text') text += block.text;
    }
    return parseJsonObject(text);
  }

  private getClient(apiKey: string): Anthropic {
    if (this.client && this.clientKey === apiKey) return this.client;
    this.client = new Anthropic({
      apiKey,
      timeout: REQUEST_TIMEOUT_MS,
      maxRetries: 1,
    });
    this.clientKey = apiKey;
    return this.client;
  }
}

/**
 * Extract a single JSON object from the model's text. Tolerates a ```json
 * fence or minor leading/trailing prose. Throws if no object is found or it
 * does not parse — the caller maps that to a safe response.
 */
function parseJsonObject(text: string): Record<string, unknown> {
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```$/i, '')
      .trim();
  }
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('model_output_not_json');
  }
  const parsed: unknown = JSON.parse(t.slice(start, end + 1));
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('model_output_not_object');
  }
  return parsed as Record<string, unknown>;
}
