import AppDataSource from "../../config/data-source/data-source";
import { BagEntity } from "../../entities/bag/bag.entity";
import { GeminiService, summarizeResults } from "./gemini.service";
import { conversationManager } from "../../config/gemini/gemini.config";

interface SearchIntent {
  queryType:
    | "product_search"
    | "general_question"
    | "recommendation"
    | "greeting"
    | "follow_up";
  category?: string;
  bagName?: string;
  price?: number;
  color?: string;
  size?: string;
  material?: string;
  features?: string[];
  limit?: number;
  originalQuery?: string;
}

export class GeminiSearchService {
  private geminiService = new GeminiService();
  private bagRepository = AppDataSource.getRepository(BagEntity);

  private async extractIntent(
    userMessage: string,
    sessionId?: string
  ): Promise<SearchIntent> {
    const prompt = `You are Emma, an expert AI shopping assistant for Avisekh Bag Pashal, a premium bag/handbag e-commerce store.

Analyze the user's message and classify it into one of these query types:

1. **"product_search"** - User wants specific bags (e.g., "show me leather bags", "red backpacks under $100")
2. **"general_question"** - Questions about bestsellers, trending items, store policies, shipping, returns
3. **"recommendation"** - User wants suggestions (e.g., "what should I buy?", "recommend something for work")
4. **"greeting"** - User is saying hi, hello, thanks, etc.
5. **"follow_up"** - User is continuing previous conversation ("show me more", "what about cheaper ones?", "do you have it in red?")

Extract ALL relevant details from their request including:
- Category (backpack, tote, clutch, messenger, etc.)
- Bag name/style (leather, canvas, designer, etc.)
- Price range (max price)
- Color preference
- Size preference (small, medium, large)
- Material preference (leather, canvas, nylon, etc.)
- Features (waterproof, laptop compartment, wheels, etc.)

Return JSON:
{
  "queryType": "product_search" | "general_question" | "recommendation" | "greeting" | "follow_up",
  "category": "string or null",
  "bagName": "string or null",
  "price": number or null,
  "color": "string or null",
  "size": "string or null",
  "material": "string or null",
  "features": ["array of features"] or null,
  "limit": number (default 10),
  "originalQuery": "original user message"
}

Examples:
"Show me red leather tote bags under $150" -> {"queryType":"product_search","bagName":"tote","price":150,"color":"red","material":"leather","originalQuery":"..."}
"Do you have waterproof backpacks?" -> {"queryType":"product_search","category":"backpack","features":["waterproof"],"originalQuery":"..."}
"What about cheaper ones?" -> {"queryType":"follow_up","originalQuery":"..."}
"Thanks!" -> {"queryType":"greeting","originalQuery":"Thanks!"}

User Request: "${userMessage}"`;

    try {
      const intent = await this.geminiService.generateJSON(prompt);
      console.log("Extracted intent:", JSON.stringify(intent, null, 2));
      return intent;
    } catch (error) {
      console.error("Intent extraction failed:", error);
      return {
        queryType: "general_question",
        originalQuery: userMessage,
      };
    }
  }

  private async findBags(intent: SearchIntent): Promise<BagEntity[]> {
    console.log(" Searching with intent:", intent);

    const queryBuilder = this.bagRepository
      .createQueryBuilder("bag")
      .leftJoinAndSelect("bag.categories", "category")
      .leftJoinAndSelect("bag.images", "images");

    // Category filter
    if (intent.category?.trim()) {
      queryBuilder.andWhere(
        "LOWER(category.categoryName) LIKE LOWER(:category)",
        { category: `%${intent.category.trim()}%` }
      );
    }

    // Name/description filter
    if (intent.bagName?.trim()) {
      queryBuilder.andWhere(
        "(LOWER(bag.name) LIKE LOWER(:bagName) OR LOWER(bag.description) LIKE LOWER(:bagName) OR LOWER(bag.type::text) LIKE LOWER(:bagName))", // ✅ Cast enum to text
        { bagName: `%${intent.bagName.trim()}%` }
      );
    }

    // Price filter
    if (intent.price && intent.price > 0) {
      queryBuilder.andWhere("bag.price <= :price", { price: intent.price });
    }

    // Color filter (searches in colors array)
    if (intent.color?.trim()) {
      queryBuilder.andWhere(
        "LOWER(:color) = ANY(SELECT LOWER(unnest(bag.colors)))",
        {
          color: intent.color.trim().toLowerCase(),
        }
      );
    }

    //  Size filter
    if (intent.size?.trim()) {
      queryBuilder.andWhere(
        "LOWER(:size) = ANY(SELECT LOWER(unnest(bag.sizes)))",
        {
          size: intent.size.trim().toLowerCase(),
        }
      );
    }

    //  Material filter
    if (intent.material?.trim()) {
      queryBuilder.andWhere("LOWER(bag.material) LIKE LOWER(:material)", {
        material: `%${intent.material.trim()}%`,
      });
    }

    //  Features filter (JSON field search)
    if (intent.features && intent.features.length > 0) {
      intent.features.forEach((feature, index) => {
        queryBuilder.andWhere(`bag.features->>'${feature}' = 'true'`);
      });
    }

    const limit = intent.limit || 20;
    queryBuilder.take(limit).orderBy("bag.createdAt", "DESC");

    const bags = await queryBuilder.getMany();
    console.log(`✅ Found ${bags.length} bags`);

    return bags;
  }

  private async getBestsellers(limit: number = 10): Promise<BagEntity[]> {
    return this.bagRepository.find({
      take: limit,
      order: { price: "DESC" },
      relations: ["categories", "images"],
    });
  }

  private async getTrendingBags(limit: number = 10): Promise<BagEntity[]> {
    return this.bagRepository.find({
      take: limit,
      order: { createdAt: "DESC" },
      relations: ["categories", "images"],
    });
  }

  private async getRecommendations(query: string): Promise<BagEntity[]> {
    return this.bagRepository.find({
      take: 8,
      order: { createdAt: "DESC" },
      relations: ["categories", "images"],
    });
  }

  // general question handler with context
  private async handleGeneralQuestion(
    query: string,
    sessionId?: string
  ): Promise<string> {
    const lowerQuery = query.toLowerCase();

    if (
      lowerQuery.includes("bestseller") ||
      lowerQuery.includes("best seller") ||
      lowerQuery.includes("top selling")
    ) {
      return "Let me show you our top bestselling bags! These are absolute customer favorites and flying off the shelves! 🌟";
    }

    if (
      lowerQuery.includes("trending") ||
      lowerQuery.includes("popular") ||
      lowerQuery.includes("hot")
    ) {
      return "Oh, you want to know what's hot right now? Here are our trending bags that everyone's loving! 🔥";
    }

    if (lowerQuery.includes("new") || lowerQuery.includes("latest")) {
      return "Fresh arrivals just for you! Check out our newest bags that just landed in our store! ✨";
    }

    // Use AI with conversation context
    const prompt = `You are Emma, a friendly and enthusiastic shopping assistant at Avisekh Bag Pashal. 

Customer asked: "${query}"

Respond naturally and conversationally (max 80 words). If they're asking about:
- Store policies → Be helpful and clear
- Product info → Be informative and enthusiastic  
- General questions → Be warm and engaging

Use casual, friendly language with emojis occasionally. Sound like a real person, not a robot.`;

    try {
      return await this.geminiService.generateText(prompt, sessionId);
    } catch (error) {
      return "I'd love to help you with that! Could you give me a bit more detail so I can assist you better? 😊";
    }
  }

  //  Main handler with session support
  public async handleSearchQuery(userMessage: string, sessionId?: string) {
    try {
      console.log(" Starting search for:", userMessage);

      const intent = await this.extractIntent(userMessage, sessionId);
      let bags: BagEntity[] = [];
      let reply: string = "";

      switch (intent.queryType) {
        case "product_search":
          bags = await this.findBags(intent);
          reply = await summarizeResults(userMessage, bags, sessionId);
          break;

        case "general_question":
          reply = await this.handleGeneralQuestion(userMessage, sessionId);
          if (
            userMessage.toLowerCase().includes("bestseller") ||
            userMessage.toLowerCase().includes("trending") ||
            userMessage.toLowerCase().includes("popular") ||
            userMessage.toLowerCase().includes("new")
          ) {
            bags = await this.getBestsellers(6);
          }
          break;

        case "recommendation":
          bags = await this.getRecommendations(userMessage);
          reply =
            "Based on what you're looking for, I've picked out some amazing options that I think you'll absolutely love! Let me know what catches your eye! ✨";
          break;

        case "follow_up":
          // For follow-ups, use context to refine search
          reply =
            "Let me find some more options for you based on what we discussed! 🔍";
          bags = await this.findBags(intent);
          if (bags.length > 0) {
            reply = await summarizeResults(userMessage, bags, sessionId);
          }
          break;

        case "greeting":
          reply =
            "Hello! 👋 I'm Emma, your personal bag shopping assistant at Avisekh Bag Pashal! I'm so excited to help you find your perfect bag today. What kind of bag are you looking for? 💼👜";
          break;

        default:
          reply =
            "I'm here to help! Could you tell me a bit more about what you're looking for? Are you searching for a specific type of bag, or would you like some recommendations? 😊";
      }

      console.log(" Search completed successfully\n");

      return { reply, bags, intent };
    } catch (error) {
      console.error(" Error in handleSearchQuery:", error);
      return {
        reply:
          "Oops! Something went wrong on my end. Could you try asking that again in a different way? I promise I'll do better this time! 😅",
        bags: [],
        intent: {
          queryType: "general_question" as const,
          originalQuery: userMessage,
        },
      };
    }
  }

  //  Clear conversation history
  public clearConversation(sessionId: string): void {
    conversationManager.clearHistory(sessionId);
  }
}
