import { Body, Controller, Post, Route, Tags, Res, TsoaResponse } from "tsoa";
import { GeminiSearchService } from "../../services/gemini/gemini-search.service";

@Route("gemini")
@Tags("Gemini")
export class GeminiController extends Controller {
  private geminiSearchService = new GeminiSearchService();

  @Post("/search")
  public async search(
    @Body() requestBody: { userMessage: string },
    @Res() notFoundResponse: TsoaResponse<404, { message: string }>,
    @Res() serverErrorResponse: TsoaResponse<500, { message: string }>
  ) {
    const { userMessage } = requestBody;
    console.log("Received userMessage:", userMessage);

    if (!userMessage) {
      this.setStatus(400);
      return { message: "userMessage is required." };
    }

    try {
      const result = await this.geminiSearchService.handleSearchQuery(
        userMessage
      );

      if (result.bags.length === 0) {
        return notFoundResponse(404, {
          message: result.reply,
        });
      }

      return {
        success: true,
        reply: result.reply,
        bags: result.bags,
        intent: result.intent,
      };
    } catch (error) {
      console.error("Error in GeminiController search:", error);
      return serverErrorResponse(500, {
        message: "An error occurred while processing your search.",
      });
    }
  }
}
