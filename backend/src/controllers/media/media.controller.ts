import { Body, Controller, Post, Route, Tags } from "tsoa";
import { MediaServices } from "../../services/media/media.services";
interface CreateMediaRequest {
  bagId: string;
  url: string;
  altText?: string;
}

@Route("media")
@Tags("Media")
export class MediaController extends Controller {
  @Post("/create-media")
  async createMedia(@Body() body: CreateMediaRequest) {
    const media = await new MediaServices().createMedia(
      body.bagId,
      body.url,
      body.altText
    );
    return {
      success: true,
      message: "Media uploaded successfully",
      data: media,
    };
  }
}
