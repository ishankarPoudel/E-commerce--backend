import {
  Controller,
  Post,
  Route,
  Tags,
  UploadedFile,
  FormField,
  Get,
} from "tsoa";
import { MediaServices } from "../../services/media/media.services";
import fs from "fs/promises"; // For async file operations
import path from "path";
import cloudinary from "../../config/cloudinary/cloudinary.config";

@Route("media")
@Tags("Media")
export class MediaController extends Controller {
  @Get("/signature")
  public async getUploadSignature() {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: "bags",
      },
      process.env.CLOUDINARY_API_SECRET!,
    );
    return {
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    };
  }
}
