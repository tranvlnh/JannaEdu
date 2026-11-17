// Minimal Gemini client: one structured-output generateContent call. Server only.
import { GoogleGenAI, ThinkingLevel, type ContentListUnion } from "@google/genai";
import { z } from "zod";

// Tried in order; the next one is used when a call fails (rate limit, outage, bad output).
const MODELS = (process.env.GEMINI_MODELS || "gemini-3.6-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const TIMEOUT_MS = 120_000;

// Text, or a list of parts such as text plus an inline audio recording.
export type ModelInput = ContentListUnion;

// Asks the model for JSON matching `schema`, then validates it: the API does not enforce every constraint.
export async function generateJson<T>(
  schema: z.ZodType<T>,
  system: string,
  input: ModelInput,
): Promise<T> {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { timeout: TIMEOUT_MS },
  });
  let lastError: unknown;
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: input,
        config: {
          systemInstruction: system,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: "application/json",
          responseJsonSchema: z.toJSONSchema(schema),
        },
      });
      if (!response.text) {
        throw new Error(`gemini ${model}: ${response.candidates?.[0]?.finishReason ?? "no candidates"}, no output`);
      }
      return schema.parse(JSON.parse(response.text));
    } catch (error) {
      console.error(`gemini ${model} failed`, error);
      lastError = error;
    }
  }
  throw lastError;
}
