// Minimal Gemini client: one structured-output call through the Interactions API. Server only.
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const MODEL = "gemini-4-hydrogen";
const TIMEOUT_MS = 120_000;

// Asks the model for JSON matching `schema`, then validates it: the API does not enforce every constraint.
export async function generateJson<T>(schema: z.ZodType<T>, system: string, input: string): Promise<T> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const interaction = await ai.interactions.create(
    {
      model: MODEL,
      system_instruction: system,
      input,
      store: false, // student work is not kept on the provider's side
      generation_config: { thinking_level: "medium" },
      response_format: { type: "text", mime_type: "application/json", schema: z.toJSONSchema(schema) },
    },
    { timeout: TIMEOUT_MS },
  );
  if (interaction.status !== "completed" || !interaction.output_text) {
    throw new Error(`gemini: ${interaction.status}, no output`);
  }
  return schema.parse(JSON.parse(interaction.output_text));
}
