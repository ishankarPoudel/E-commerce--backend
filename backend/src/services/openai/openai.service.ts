import AppDataSource from "../../config/data-source/data-source";
import {
  AI_MODEL,
  AI_TEMPERATURE,
  openAIConfig,
} from "../../config/open-ai/open-ai.config";
import { BagEntity } from "../../entities/bag/bag.entity";
import { Category } from "../../entities/category/category.entity";

interface ParsedIntent {
  category?: string;
  color?: string;
  material?: string;
  price?: number;
}
export class OpenAIService {
  private bagRepo = AppDataSource.getRepository(BagEntity);
  private categoryRepo = AppDataSource.getRepository(Category);

  async extractIntent(userMessage: string) {
    const aiResponse = await openAIConfig.chat.completions.create({
      model: AI_MODEL,
      temperature: AI_TEMPERATURE,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: `You are a shopping assistant. Extract key search info from this message: "${userMessage}".
      Respond in JSON format like:{ "category": "backpack", "brand": "Nike", "price": 100 }`,
        },
      ],
    });
    try {
      const content = aiResponse.choices[0].message?.content;
      const parsed = JSON.parse(content || "{}");
      return parsed;
    } catch (error) {
      console.error("Error extracting intent:", error);
      return null;
    }
  }

  async findMatchingProducts(filters: ParsedIntent) {
    const query = this.bagRepo
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.categories", "category")
      .leftJoinAndSelect("p.bagImages", "images");

    if (filters.category) {
      query.andWhere("category.name ILIKE :category", {
        category: `%${filters.category}%`,
      });
      query.orWhere("p.name ILIKE :category", {
        category: `%${filters.category}%`,
      });
    }

    if (filters.price) {
      query.andWhere("p.price <= :price", { price: filters.price });
    }

    return query.limit(5).getMany();
  }

  async generateResponse(userMessage: string, products: BagEntity[]) {
    const productList =
      products.map((p) => `${p.name} ($${p.price})`).join(", ") ||
      "No matching products found.";

    const reply = await openAIConfig.chat.completions.create({
      model: AI_MODEL,
      temperature: AI_TEMPERATURE,
      messages: [
        {
          role: "user",
          content: `You are a friendly shopping assistant. The user said: "${userMessage}".
      Here are the product matches: ${productList}.
      Write a short natural-sounding reply to the user.`,
        },
      ],
    });

    return (
      reply.choices[0].message?.content ||
      "Sorry, I couldn't generate a response."
    );
  }
}
