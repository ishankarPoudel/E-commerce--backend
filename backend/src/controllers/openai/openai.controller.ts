import { Body, Controller, Post, Request, Route, Tags } from "tsoa";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { OpenAIService } from "../../services/openai/openai.service";

@Route("openai")
@Tags("OpenAI")
export class OpenAiController extends Controller {
  @Post("/chatWithAI")
  async chatWithAi(
    @Request() req: AuthenticatedRequest,
    @Body() body: { message: string }
  ) {
    const { message } = body;
    if (!message) {
      this.setStatus(400);
      return {
        success: false,
        message: "Message is required",
      };
    }
    const openAIService = new OpenAIService();
    const intent = await openAIService.extractIntent(message);
    if (!intent) {
      this.setStatus(500);
      return {
        success: false,
        message: "Failed to extract intent from the message",
      };
    }

    const response = await openAIService.generateResponse(
      message,
      await openAIService.findMatchingProducts(intent)
    );
    if (response) {
      return response;
    }

    const products = await openAIService.findMatchingProducts(intent);
    return {
      success: true,
      message: "Products fetched successfully",
      data: products,
    };
  }
}
