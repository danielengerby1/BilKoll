import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import { MECHANIC_SYSTEM_PROMPT, QUOTE_SYSTEM_PROMPT, extractJson, mechanicUserPrompt, quoteUserPrompt } from "../prompts";
import { MechanicAnswer, QuoteExplanation, type AIService } from "../types";

export function createAnthropicService(model: string): AIService {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  async function completeJson<T extends z.ZodType>(
    schema: T,
    system: string,
    messages: Anthropic.MessageParam[],
  ): Promise<z.infer<T> | null> {
    try {
      const res = await client.messages.create({ model, max_tokens: 1024, system, messages });
      const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
      const parsed = schema.safeParse(extractJson(text));
      return parsed.success ? parsed.data : null;
    } catch (err) {
      console.error("[ai] anthropic request failed", err);
      return null;
    }
  }

  return {
    provider: "anthropic",
    model,
    askMechanic(input) {
      const recent = input.history.slice(-8);
      // The API requires the conversation to start with a user turn.
      while (recent[0]?.role === "assistant") recent.shift();
      const history: Anthropic.MessageParam[] = recent.map((t) => ({ role: t.role, content: t.content }));
      return completeJson(MechanicAnswer, MECHANIC_SYSTEM_PROMPT, [
        ...history,
        { role: "user", content: mechanicUserPrompt(input) },
      ]);
    },
    explainQuote(input) {
      return completeJson(QuoteExplanation, QUOTE_SYSTEM_PROMPT, [{ role: "user", content: quoteUserPrompt(input) }]);
    },
  };
}
