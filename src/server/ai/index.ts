import { createAnthropicService } from "./providers/anthropic";
import { createMockAIService } from "./providers/mock";
import type { AIService } from "./types";

export type * from "./types";

export const DEFAULT_AI_MODEL = "claude-sonnet-5-5";

let cached: AIService | undefined;

export function getAIService(): AIService {
  if (cached) return cached;
  const provider = process.env.AI_PROVIDER ?? "mock";
  const model = process.env.AI_MODEL ?? DEFAULT_AI_MODEL;
  if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY) {
    console.warn("[ai] AI_PROVIDER=anthropic but ANTHROPIC_API_KEY is missing – using mock provider");
    cached = createMockAIService();
  } else {
    cached = provider === "anthropic" ? createAnthropicService(model) : createMockAIService();
  }
  return cached;
}
