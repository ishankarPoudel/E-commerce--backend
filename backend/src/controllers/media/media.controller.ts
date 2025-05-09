import { Controller, Post, Route, Tags, UploadedFile, FormField } from "tsoa";
import { MediaServices } from "../../services/media/media.services";

@Route("media")
@Tags("Media")
export class MediaController extends Controller {
  @Post("/upload")
  public async uploadMedia(
    @FormField() bagId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      this.setStatus(400);
      return { success: false, message: "No file uploaded" };
    }

    const media = await new MediaServices().addMediaToBag(
      bagId,
      `/uploads/${file.filename}`
    );

    return {
      success: true,
      message: "Media uploaded successfully",
      data: media,
    };
  }
}
