import OpenAI from "openai";

export const openAIConfig = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export const AI_MAX_TOKENS = Number(process.env.AI_MAX_TOKENS) || 500;
export const AI_TEMPERATURE = Number(process.env.AI_TEMPERATURE) || 0.7;
export const AI_MODEL = process.env.AI_MODEL || "gpt-4.1-mini";
