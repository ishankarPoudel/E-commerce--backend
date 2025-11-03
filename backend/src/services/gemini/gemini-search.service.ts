import AppDataSource from "../../config/data-source/data-source";
import { BagEntity } from "../../entities/bag/bag.entity";
import { GeminiService, summarizeResults } from "./gemini.service";

interface SearchIntent {
  category?: string;
  bagName?: string;
  price?: number;
  limit?: number;
}

export class GeminiSearchService {
  private geminiService = new GeminiService();
  private bagRepository = AppDataSource.getRepository(BagEntity);

  private async extractIntent(userMessage: string): Promise<SearchIntent> {
    const prompt = `You are an expert at parsing user requests for bag/handbag products. Extract key search parameters from the user's message and return them as a structured JSON object. 
    
    CRITICAL RULES:
    - ONLY extract fields that are EXPLICITLY mentioned by the user
    - If the user's message is vague or unclear, return an empty object {}
    - For category, use singular form (e.g., "backpack" not "backpacks")
    - Be strict - don't assume or infer information
    - Schema: { "category": "string", "bagName": "string", "price": number, "limit": number }
    
    Examples:
    "Show me leather bags under 5000 rupees" -> {"bagName": "leather", "price": 5000}
    "I want a backpack" -> {"category": "backpack"}
    "Find red tote bags" -> {"bagName": "red tote", "category": "tote"}
    "Show me handbags" -> {"category": "handbag"}
    "bags under 3000" -> {"price": 3000}
    "hello" -> {}
    "what bags do you have" -> {}
    
    User Request: "${userMessage}"`;

    try {
      const intent = await this.geminiService.generateJSON(prompt);
      console.log(" Extracted intent:", JSON.stringify(intent, null, 2));

      const hasValidIntent =
        (intent.category && intent.category.trim().length > 0) ||
        (intent.bagName && intent.bagName.trim().length > 0) ||
        (intent.price && intent.price > 0);

      if (!hasValidIntent) {
        console.log("No valid intent extracted, returning empty object");
        return {};
      }

      return intent || {};
    } catch (error) {
      console.error(" Failed to extract intent:", error);
      return {};
    }
  }

  private async findBags(intent: SearchIntent): Promise<BagEntity[]> {
    console.log("Searching with intent:", intent);

    const hasValidCriteria =
      (intent.category && intent.category.trim().length > 0) ||
      (intent.bagName && intent.bagName.trim().length > 0) ||
      (intent.price && intent.price > 0);

    if (!hasValidCriteria) {
      return [];
    }

    const queryBuilder = this.bagRepository
      .createQueryBuilder("bag")
      .leftJoinAndSelect("bag.categories", "category")
      .leftJoinAndSelect("bag.bagImages", "bagImages");

    let hasConditions = false;

    // Search by category name (many-to-many relation)
    if (intent.category && intent.category.trim().length > 0) {
      queryBuilder.andWhere(
        "LOWER(category.categoryName) LIKE LOWER(:category)",
        {
          category: `%${intent.category.trim()}%`,
        }
      );
      hasConditions = true;
      console.log(`   📁 Filtering by category: ${intent.category}`);
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
      console.log(`   🏷️  Filtering by name/description: ${intent.bagName}`);
    }

    // Search by price (less than or equal to)
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
    return bags;
  }

  public async handleSearchQuery(userMessage: string) {
    try {
      console.log("Starting search for:", userMessage);

      const intent = await this.extractIntent(userMessage);
      const bags = await this.findBags(intent);
      const reply = await summarizeResults(userMessage, bags);

      return {
        reply,
        bags,
        intent,
      };
    } catch (error) {
      console.error("Error in handleSearchQuery:", error);
      throw error;
    }
  }
}
