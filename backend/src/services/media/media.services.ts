import { AppDataSource } from "../../data-source";
import { BagEntity } from "../../entities/bag/bag.entity";
import { MediaEntity } from "../../entities/media/media.entity";
import { ApiError } from "../../utils/apiError";

export class MediaServices {
  async createMedia(bagId: string, url: string, altText?: string) {
    const mediaRepo = AppDataSource.getRepository(MediaEntity);
    const bag = await AppDataSource.getRepository(BagEntity).findOneBy({
      id: bagId,
    });
    if (!bag) throw new ApiError(404, "Bag not found");
    const media = mediaRepo.create({ url, altText, bag });
    return await mediaRepo.save(media);
  }
}
