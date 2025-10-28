import { text } from "stream/consumers";
import { genAI } from "../../config/gemini/gemini.config";

export class GeminiService {
  async generateText(prompt: string) {
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          maxOutputTokens: 200,
        },
      });

      const text =
        (response as any).text ?? (response as any).response?.text?.();
      return (typeof text === "function" ? text() : text) ?? String(response);
    } catch (error) {
      console.error("Error generating text with Gemini API:", error);
      throw error;
    }
  }

  async generateJSON(prompt: string) {
    const raw = await this.generateText(prompt);
    try {
      const cleanedText = raw.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error("Error parsing JSON from Gemini response:", error);
      throw new Error("Failed to parse JSON from AI response");
    }
  }
}
