import AppDataSource from "../../config/data-source/data-source";
import { BagEntity } from "../../entities/bag/bag.entity";
import { CartItemEntity } from "../../entities/cart/cartItem.entity";
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

  async deleteBagById(id: string) {
    return await AppDataSource.transaction(
      async (transactionalEntityManager) => {
        const bagRepo = transactionalEntityManager.getRepository(BagEntity);
        const cartItemRepo =
          transactionalEntityManager.getRepository(CartItemEntity);

      
        const bag = await bagRepo.findOne({
          where: { id },
          relations: ["images"],
        });

        if (!bag) {
          throw new ApiError(404, "Bag not found.");
        }

        // Step 1: Delete all cart items referencing this bag
        await cartItemRepo.delete({ product: { id } });
        console.log(`✅ Deleted cart items for bag: ${bag.name}`);

       
        if (bag.images && bag.images.length > 0) {
          const imageIds = bag.images.map((img) => img.id);
          await  new MediaService().(imageIds);
          console.log(
            `✅ Deleted ${bag.images.length} images for bag: ${bag.name}`,
          );
        }

        // Step 3: Delete the bag
        await bagRepo.remove(bag);

        console.log(`✅ Successfully deleted bag: ${bag.name} (ID: ${id})`);
        return bag;
      },
    );
  }
}
