import AppDataSource from "../../config/data-source/data-source";
import { BagEntity } from "../../entities/bag/bag.entity";
import { GeminiService, summarizeResults } from "./gemini.service";

interface SearchIntent {
  queryType:
    | "product_search"
    | "general_question"
    | "recommendation"
    | "greeting";
  category?: string;
  bagName?: string;
  price?: number;
  limit?: number;
  originalQuery?: string;
}

export class GeminiSearchService {
  private geminiService = new GeminiService();
  private bagRepository = AppDataSource.getRepository(BagEntity);

  private async extractIntent(userMessage: string): Promise<SearchIntent> {
    const prompt = `You are an expert AI assistant for a bag/handbag e-commerce store. Analyze the user's message and classify it into one of these query types:

1. "product_search" - User wants to find specific bags (e.g., "show me leather bags", "bags under $100")
2. "general_question" - User asks about bestsellers, trending items, store info, policies, etc.
3. "recommendation" - User wants suggestions (e.g., "what should I buy?", "recommend something")
4. "greeting" - User is just saying hi, hello, etc.

Return a JSON object with this structure:
{
  "queryType": "product_search" | "general_question" | "recommendation" | "greeting",
  "category": "string (only for product_search)",
  "bagName": "string (only for product_search)",
  "price": number (only for product_search),
  "limit": number (optional),
  "originalQuery": "string (original user message)"
}

Examples:
"Show me leather bags under $100" -> {"queryType": "product_search", "bagName": "leather", "price": 100, "originalQuery": "Show me leather bags under $100"}
"What are your bestsellers?" -> {"queryType": "general_question", "originalQuery": "What are your bestsellers?"}
"Recommend a bag for work" -> {"queryType": "recommendation", "originalQuery": "Recommend a bag for work"}
"Hello" -> {"queryType": "greeting", "originalQuery": "Hello"}
"I want a backpack" -> {"queryType": "product_search", "category": "backpack", "originalQuery": "I want a backpack"}

User Request: "${userMessage}"`;

    try {
      const intent = await this.geminiService.generateJSON(prompt);
      console.log("Extracted intent:", JSON.stringify(intent, null, 2));
      return intent;
    } catch (error) {
      return {
        queryType: "general_question",
        originalQuery: userMessage,
      };
    }
  }

  private async findBags(intent: SearchIntent): Promise<BagEntity[]> {
    console.log("Searching with intent:", intent);

    const queryBuilder = this.bagRepository
      .createQueryBuilder("bag")
      .leftJoinAndSelect("bag.categories", "category")
      .leftJoinAndSelect("bag.images", "images");

    let hasConditions = false;

    // Search by category
    if (intent.category && intent.category.trim().length > 0) {
      queryBuilder.andWhere(
        "LOWER(category.categoryName) LIKE LOWER(:category)",
        {
          category: `%${intent.category.trim()}%`,
        }
      );
      hasConditions = true;
      console.log(`Filtering by category: ${intent.category}`);
    }

    // Search by bag name or description
    if (intent.bagName && intent.bagName.trim().length > 0) {
      queryBuilder.andWhere(
        "(LOWER(bag.name) LIKE LOWER(:bagName) OR LOWER(bag.description) LIKE LOWER(:bagName))",
        {
          bagName: `%${intent.bagName.trim()}%`,
        }
      );
      hasConditions = true;
      console.log(`Filtering by name/description: ${intent.bagName}`);
    }

    // Search by price
    if (intent.price && intent.price > 0) {
      queryBuilder.andWhere("bag.price <= :price", {
        price: intent.price,
      });
      hasConditions = true;
    }

    // Apply limit
    const limit = intent.limit || 20;
    queryBuilder.take(limit);

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
      relations: ["categories", "bagImages"],
    });
  }

  private async getRecommendations(query: string): Promise<BagEntity[]> {
    // Get a diverse selection of bags
    return this.bagRepository.find({
      take: 6,
      order: { createdAt: "DESC" },
      relations: ["categories", "images"],
    });
  }

  private async handleGeneralQuestion(query: string): Promise<string> {
    const lowerQuery = query.toLowerCase();

    // Check for common questions
    if (
      lowerQuery.includes("bestseller") ||
      lowerQuery.includes("best seller") ||
      lowerQuery.includes("top selling")
    ) {
      const bags = await this.getBestsellers(5);
      if (bags.length > 0) {
        return "Here are our top bestselling bags! These are customer favorites:";
      }
    }

    if (
      lowerQuery.includes("trending") ||
      lowerQuery.includes("popular") ||
      lowerQuery.includes("hot")
    ) {
      const bags = await this.getTrendingBags(5);
      if (bags.length > 0) {
        return "Check out what's trending right now! These bags are super popular:";
      }
    }

    if (lowerQuery.includes("new") || lowerQuery.includes("latest")) {
      const bags = await this.getTrendingBags(5);
      if (bags.length > 0) {
        return "Here are our newest arrivals! Fresh styles just for you:";
      }
    }

    // Use AI for other general questions
    const prompt = `You are a friendly and helpful shopping assistant for a bag/handbag store. 
A customer asked: "${query}"

Provide a helpful, friendly response (max 80 words). If they're asking about products, policies, or the store, answer naturally. Be conversational and helpful.`;

    try {
      return await this.geminiService.generateText(prompt);
    } catch (error) {
      return "I'd be happy to help you! Could you please provide more details about what you're looking for?";
    }
  }

  public async handleSearchQuery(userMessage: string) {
    try {
      console.log(" Starting search for:", userMessage);

      const intent = await this.extractIntent(userMessage);
      let bags: BagEntity[] = [];
      let reply: string = "";

      switch (intent.queryType) {
        case "product_search":
          bags = await this.findBags(intent);
          reply = await summarizeResults(userMessage, bags);
          break;

        case "general_question":
          reply = await this.handleGeneralQuestion(userMessage);
          if (
            userMessage.toLowerCase().includes("bestseller") ||
            userMessage.toLowerCase().includes("best seller") ||
            userMessage.toLowerCase().includes("trending") ||
            userMessage.toLowerCase().includes("popular") ||
            userMessage.toLowerCase().includes("new") ||
            userMessage.toLowerCase().includes("latest")
          ) {
            bags = await this.getBestsellers(6);
          }
          break;

        case "recommendation":
          bags = await this.getRecommendations(userMessage);
          reply =
            "Based on your request, here are some great options I think you'll love:";
          break;

        case "greeting":
          reply =
            "Hello! 👋 Welcome to our Avisekh Bag Pashal. I'm here to help you find the perfect bag. What are you looking for today?";
          break;

        default:
          reply =
            "I'd be happy to help you! Could you tell me more about what you're looking for?";
      }

      console.log(" Search completed successfully\n");

      return {
        reply,
        bags,
        intent,
      };
    } catch (error) {
      console.error("Error in handleSearchQuery:", error);
      return {
        reply:
          "I apologize, but I encountered an error. Could you please try rephrasing your question?",
        bags: [],
        intent: {
          queryType: "general_question" as const,
          originalQuery: userMessage,
        },
      };
    }
  }
}
