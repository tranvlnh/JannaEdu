// Minimal Gemini client: one structured-output call through the Interactions API. Server only.
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const MODEL = "gemini-4-hydrogen";
const TIMEOUT_MS = 120_000;

// Text, or a list of parts such as text plus an audio recording.
export type ModelInput = Parameters<
  GoogleGenAI["interactions"]["create"]
>[0]["input"];

// Asks the model for JSON matching `schema`, then validates it: the API does not enforce every constraint.
export async function generateJson<T>(
  schema: z.ZodType<T>,
  system: string,
  input: ModelInput,
): Promise<T> {
  // v1beta: audio input is not available on the default API version yet.
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { apiVersion: "v1beta" },
  });
  const interaction = await ai.interactions.create(
    {
      model: MODEL,
      system_instruction: system,
      input,
      store: false, // student work is not kept on the provider's side
      generation_config: { thinking_level: "medium" },
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: z.toJSONSchema(schema),
      },
    },
    { timeout: TIMEOUT_MS },
  );
  if (interaction.status !== "completed" || !interaction.output_text) {
    throw new Error(`gemini: ${interaction.status}, no output`);
  }
  return schema.parse(JSON.parse(interaction.output_text));
}
