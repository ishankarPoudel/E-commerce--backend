import AppDataSource from "../../config/data-source/data-source";
import { BagEntity } from "../../entities/bag/bag.entity";
import { MediaEntity } from "../../entities/media/media.entity";
import { ApiError } from "../../utils/apiError";

interface CreateMediaInput {
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

export class MediaService {
  private mediaRepo = AppDataSource.getRepository(MediaEntity);
  private bagRepo = AppDataSource.getRepository(BagEntity);

  async createMedia(input: CreateMediaInput): Promise<MediaEntity> {
    const bag = await this.bagRepo.findOne({ where: { id: input.bagId } });

    if (!bag) {
      throw new ApiError(404, "Bag not found");
    }

    const media = this.mediaRepo.create({
      url: input.url,
      publicId: input.publicId,
      format: input.format,
      width: input.width,
      height: input.height,
      bytes: input.bytes,
      altText: input.altText || bag.name,
      sortOrder: input.sortOrder || 0,
      bag: bag,
    });

    return await this.mediaRepo.save(media);
  }

  async createMultipleMedia(
    bagId: string,
    images: Omit<CreateMediaInput, "bagId">[],
  ): Promise<MediaEntity[]> {
    const bag = await this.bagRepo.findOne({ where: { id: bagId } });

    if (!bag) {
      throw new ApiError(404, "Bag not found");
    }

    const mediaEntities = images.map((image, index) =>
      this.mediaRepo.create({
        url: image.url,
        publicId: image.publicId,
        format: image.format,
        width: image.width,
        height: image.height,
        bytes: image.bytes,
        altText: image.altText || `${bag.name} - Image ${index + 1}`,
        sortOrder: image.sortOrder ?? index,
        bag: bag,
      }),
    );

    return await this.mediaRepo.save(mediaEntities);
  }

  async deleteMedia(mediaId: string): Promise<void> {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId } });

    if (!media) {
      throw new ApiError(404, "Media not found");
    }

    // TODO: Delete from Cloudinary using publicId
    // await cloudinary.uploader.destroy(media.publicId);

    await this.mediaRepo.remove(media);
  }
}
