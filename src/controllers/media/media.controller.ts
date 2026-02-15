import { Controller, Post, Route, Tags, Get, Body, Middlewares } from "tsoa";
import cloudinary from "../../config/cloudinary/cloudinary.config";
import { MediaService } from "../../services/media/media.services";
import {
  authenticateToken,
  authorizeRoles,
} from "../../middlewares/auth.middleware";
import { UserRole } from "../../entities/user/userInfo/user.userInfo.entity";

interface UploadImageBody {
  bagId: string;
  url: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  altText?: string;
  sortOrder?: number;
}

interface UploadMultipleImagesBody {
  bagId: string;
  images: Omit<UploadImageBody, "bagId">[];
}

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

  @Post("/upload")
  public async saveImagedToDB(@Body() body: UploadImageBody) {
    const media = await new MediaService().createMedia({
      bagId: body.bagId,
      url: body.url,
      publicId: body.publicId,
      format: body.format,
      width: body.width,
      height: body.height,
      bytes: body.bytes,
      altText: body.altText,
      sortOrder: body.sortOrder,
    });
    return {
      success: true,
      message: "Image metadata saved successfully",
      data: media,
    };
  }
  @Post("upload-multiple")
  @Middlewares(authenticateToken, authorizeRoles(UserRole.ADMIN))
  public async saveMultipleImagesToDB(@Body() body: UploadMultipleImagesBody) {
    const media = await new MediaService().createMultipleMedia(
      body.bagId,
      body.images,
    );
    return {
      success: true,
      message: "Images metadata saved successfully",
      data: media,
    };
  }

  @Post("/delete-single-image")
  @Middlewares(authenticateToken, authorizeRoles(UserRole.ADMIN))
  public async deleteSingleImageFromCloudinary(
    @Body() body: { publicId: string },
  ) {
    await new MediaService().deleteMediaById(body.publicId);
    return {
      success: true,
      message: "Image deleted successfully",
    };
  }

  @Post("/delete-multiple-images")
  @Middlewares(authenticateToken, authorizeRoles(UserRole.ADMIN))
  public async deleteMultipleImagesFromCloudinary(
    @Body() body: { publicId: string[] },
  ) {
    await new MediaService().deleteMultipleMedia(body.publicId);
    return {
      success: true,
      message: "Images deleted successfully",
    };
  }
}
