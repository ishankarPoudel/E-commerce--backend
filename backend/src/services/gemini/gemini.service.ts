import { genAI } from "../../config/gemini/gemini.config";
import { BagEntity } from "../../entities/bag/bag.entity";

export class GeminiService {
  async generateText(prompt: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;

      const text = response.text();
      return text;
    } catch (error) {
      console.error("Error in generateText:", error);
      throw new Error("Failed to generate text from Gemini API.");
    }
  }

  async generateJSON(prompt: string): Promise<any> {
    try {
      const jsonPrompt = `${prompt}

CRITICAL: Respond with ONLY a valid JSON object.
 No markdown code blocks, no \`\`\`json, no explanations.
  Just the raw JSON object starting with { and ending with }.`;

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(jsonPrompt);
      const response = await result.response;
      let rawText = response.text();

      if (!rawText) {
        throw new Error("Received empty response from AI.");
      }
      rawText = rawText.trim();

      // Remove ```json and ``` markers i
      if (rawText.includes("```")) {
        rawText = rawText
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim();
      }

      // Try to extract JSON object if there's extra text
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        rawText = jsonMatch[0];
      }

      console.log("Cleaned JSON text:", rawText);

      return JSON.parse(rawText);
    } catch (error) {
      console.error("Error in generateJSON:", error);
      throw new Error("Failed to generate or parse JSON from AI response.");
    }
  }
}

export const summarizeResults = async (
  userMessage: string,
  bags: BagEntity[]
): Promise<string> => {
  if (bags.length === 0) {
    return "I couldn't find any bags that match your search. Would you like to try a different description?";
  }

  // Build a summary of the bags found
  const bagSummary = bags
    .slice(0, 5) // Only summarize top 5
    .map((bag) => {
      const categoryNames =
        bag.categories?.map((c) => c.categoryName).join(", ") ||
        "Uncategorized";
      return `- ${bag.name} (${categoryNames}) at $${bag.price.toFixed(2)}`;
    })
    .join("\n");

  const prompt = `You are a friendly and helpful shopping assistant.
A user has searched for bags, and we found the following options. 
Your task is to provide a concise and helpful summary based on their original request.

User's original request: "${userMessage}"

Available bag options:
${bagSummary}

Please write a short and friendly reply (max 60 words). If there are several options, suggest the top 2 or 3 best matches. 
End with a clear call to action, like encouraging them to look at the results below.`;

  try {
    const geminiService = new GeminiService();
    const response = await geminiService.generateText(prompt);
    return response;
  } catch (error) {
    console.error("Error summarizing results with Gemini API:", error);
    return `I found ${bags.length} great ${
      bags.length === 1 ? "option" : "options"
    } for you! Have a look at the bags below.`;
  }
};
