import AppDataSource from "../../config/data-source/data-source";
import { BagEntity } from "../../entities/bag/bag.entity";
import { addBagValidator } from "../../validators/addBag.validator";
import { GeminiService } from "./gemini.service";

export class GeminiSearchService {
  private geminiService = new GeminiService();
  private bagRepo = AppDataSource.getRepository(BagEntity);

  async extractIntent(userMessage: string) {
    const prompt =
      `You are an extractor that MUST respond only with a JSON object(no explanations). 
        Parse the follwoing user request and extract keys: category, bagName, price, and optional limit (integer).
        if a key is missing, omit it. Example output: {"category": "handbags", "bagName": "leather bag", "price": 100, "limit": 5}` +
      `\nUser request: "${userMessage}"`;
    try {
      const parsedResponse = await this.geminiService.generateJSON(prompt);
      if (typeof parsedResponse !== "object" || parsedResponse === null) {
        throw new Error("Parsed response is not a valid JSON object");
      }
      return parsedResponse;
    } catch (error) {
      console.error("Error in extractIntent:", error);
      throw error;
    }
  }

  async findMatchingBags(intent: any) {
    const limit = intent.limit || 5;
    const query = this.bagRepo
      .createQueryBuilder("bag")
      .leftJoinAndSelect("bag.category", "category")
      .leftJoinAndSelect("bag.images", "images")
      .take(limit);
    if (intent.category) {
      query.andWhere("category.name ILIKE :category", {
        category: `%${intent.category}%`,
      });
    }
    if (intent.bagName) {
      query.andWhere("bag.name ILIKE :bagName", {
        bagName: `%${intent.bagName}%`,
      });
    }
    if (intent.price) {
      query.andWhere("bag.price <= :price", { price: intent.price });
    }

    return query.getMany();
  }

  async summarizeBags(userMessage: string, bags: BagEntity[]) {
    const bagSummary =
      bags.length > 0
        ? bags.map((bag) => `- ${bag.name} at $${bag.price}`).join("\n")
        : "No bags found.";

    const prompt = `You are a helpful assistant. Based on the user's request and the following bag options, provide a concise summary.
        User request: "${userMessage}"
        Bag options:
        ${bagSummary}
       write a short reply max(60 words) addressing the user's request. 
       Propose the 3 best matches if available and add a quick CTA (eg view more )`;
    try {
      const reply = await this.geminiService.generateText(prompt);
      return reply;
    } catch (error) {
      console.error("Error in summarizeBags:", error);
    }
  }

  async handleUserQuery(userMessage: string) {
    const intent = await this.extractIntent(userMessage);
    if (!intent) {
      throw new Error("Could not extract intent from user message");
    }
    const bags = await this.findMatchingBags(intent);

    const reply = await this.summarizeBags(userMessage, bags);
    return { success: true, userMessage, bags, reply };
  }
}
