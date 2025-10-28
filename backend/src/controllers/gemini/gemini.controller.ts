import { Body, Controller, Post, Route, Tags } from "tsoa";
import { GeminiSearchService } from "../../services/gemini/gemini-search.service";
import { GeminiService } from "../../services/gemini/gemini.service";

@Route("gemini")
@Tags("Gemini")
export class GeminiController extends Controller {
  private geminiSearchService = new GeminiSearchService();
  private geminiService = new GeminiService();

  @Post("/search-bags")
  async searchBags(@Body() requestBody: { userMessage: string }) {
    const { userMessage } = requestBody;
    const result = await this.geminiSearchService.handleUserQuery(userMessage);
    if (!result) {
      this.setStatus(500);
      return { error: "Failed to process the request" };
    }
    return {
      sucess: true,
      message: result.reply,
      data: result.bags,
      intent: result.userMessage,
    };
  }
}
