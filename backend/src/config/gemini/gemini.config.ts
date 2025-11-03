import { GoogleGenerativeAI } from "@google/generative-ai";

// Use the official Google Generative AI SDK
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
