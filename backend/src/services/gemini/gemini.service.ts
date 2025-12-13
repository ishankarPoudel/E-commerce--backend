import { genAI, conversationManager } from "../../config/gemini/gemini.config";
import { BagEntity } from "../../entities/bag/bag.entity";

export class GeminiService {
  //  Generate text with conversation history
  async generateText(prompt: string, sessionId?: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });

      if (sessionId) {
        // Use chat session with history
        const history = conversationManager.getHistory(sessionId);
        const chat = model.startChat({
          history: history.map((h) => ({
            role: h.role,
            parts: [{ text: h.parts }],
          })),
        });

        const result = await chat.sendMessage(prompt);
        const response = result.response.text();

        // Store the conversation
        conversationManager.addMessage(sessionId, "user", prompt);
        conversationManager.addMessage(sessionId, "model", response);

        return response;
      } else {
        // Single message without history
        const result = await model.generateContent(prompt);
        return result.response.text();
      }
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

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });
      const result = await model.generateContent(jsonPrompt);
      let rawText = result.response.text();

      if (!rawText) {
        throw new Error("Received empty response from AI.");
      }
      rawText = rawText.trim();

      // Remove ```json and ``` markers
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

      return JSON.parse(rawText);
    } catch (error) {
      console.error("Error in generateJSON:", error);
      throw new Error("Failed to generate or parse JSON from AI response.");
    }
  }
}

// ✅ Enhanced summarize with bag details
export const summarizeResults = async (
  userMessage: string,
  bags: BagEntity[],
  sessionId?: string
): Promise<string> => {
  if (bags.length === 0) {
    return "I couldn't find any bags matching your request. Would you like me to show you our bestsellers or trending items instead? 😊";
  }

  // ✅ Build detailed bag summary with ALL entity properties
  const bagSummary = bags
    .slice(0, 5)
    .map((bag) => {
      const categoryNames =
        bag.categories?.map((c) => c.categoryName).join(", ") || "General";
      const colors = bag.colors?.join(", ") || "Various colors";
      const sizes = bag.sizes?.join(", ") || "Standard size";
      const features = bag.features
        ? Object.entries(bag.features)
            .filter(([_, value]) => value === true)
            .map(([key]) => key)
            .join(", ")
        : "No special features";

      return `
- **${bag.name}** 
  Category: ${categoryNames}
  Price: $${bag.price.toFixed(2)}
  Material: ${bag.material || "Not specified"}
  Colors: ${colors}
  Sizes: ${sizes}
  Weight: ${bag.weightKg}kg
  ${bag.capacityLiters ? `Capacity: ${bag.capacityLiters}L` : ""}
  Features: ${features}
  ${
    bag.description
      ? `Description: ${bag.description.substring(0, 100)}...`
      : ""
  }
      `.trim();
    })
    .join("\n\n");

  const prompt = `You are Emma, a friendly and knowledgeable shopping assistant at Avisekh Bag Pashal. 
You have a warm, conversational tone and love helping customers find their perfect bag.

**Context of conversation:**
User originally asked: "${userMessage}"

**Available options we found:**
${bagSummary}

**Your task:**
Write a natural, friendly response (max 50 words) that:
1. Acknowledges their specific request
2. Highlights 2-3 best matches from the list with specific details (mention colors, sizes, materials, or features)
3. Sounds conversational and helpful (use "I found", "You might love", "Perfect for", etc.)
4. Ends with an encouraging call-to-action

Be specific about bag features and details. Don't just list bags - explain WHY they're good matches.`;

  try {
    const geminiService = new GeminiService();
    const response = await geminiService.generateText(prompt, sessionId);
    return response;
  } catch (error) {
    console.error("Error summarizing results:", error);
    return `Great news! I found ${bags.length} awesome ${
      bags.length === 1 ? "bag" : "bags"
    } that match what you're looking for! Take a look below and let me know if you'd like more details about any of them. 😊`;
  }
};
