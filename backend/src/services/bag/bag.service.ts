import { In } from "typeorm";
import { AppDataSource } from "../../data-source";
import { BagEntity } from "../../entities/bag/bag.entity";
import { Category } from "../../entities/category/category.entity";
import { addBagValidator } from "../../validators/addBag.validator";
import { ApiError } from "../../utils/apiError";
import { Query } from "tsoa";
import { updateBagValidator } from "../../validators/updateBag.validator";
import { MediaEntity } from "../../entities/media/media.entity";
import { min } from "class-validator";

export class BagService {
  async addBag(bag: addBagValidator) {
    const newBag = new BagEntity();
    newBag.name = bag.name;
    newBag.price = bag.price;
    newBag.description = bag.description;

    const categoryRepo = AppDataSource.getRepository(Category);
    newBag.categories = await categoryRepo.find({
      where: {
        id: In(bag.categories),
      },
    });
    if (newBag.categories.length === 0) {
      throw new ApiError(400, "No categories found for the provided IDs.");
    }
    const savedBag = await AppDataSource.getRepository(BagEntity).save(newBag);
    return savedBag;
  }

  async getAllBags(
    page?: number,
    limit?: number,
    search?: string,
    category?: string,
    minPrice?: number,
    maxPrice?: number
  ) {
    const offset = ((page || 1) - 1) * (limit || 10);

    const queryBuilder = await AppDataSource.getRepository(BagEntity)
      .createQueryBuilder("bag")
      .leftJoinAndSelect("bag.categories", "categories")
      .leftJoinAndSelect("bag.bagImages", "bagImages")
      .orderBy("bag.createdAt", "DESC")
      .skip(offset)
      .take(limit || 10);

    if (search) {
      queryBuilder.andWhere(
        "(LOWER(bag.name) LIKE LOWER(:search) OR LOWER(bag.description) LIKE LOWER(:search))",
        { search: `%${search}%` }
      );
    }
    if (category && category.length > 0) {
      queryBuilder.andWhere("category.id IN (:...categoryIds)", { category });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere("bag.price >= :minPrice", { minPrice });
    }
    if (maxPrice !== undefined) {
      queryBuilder.andWhere("bag.price <= :maxPrice", { maxPrice });
    }

    const [bags, total] = await queryBuilder.getManyAndCount();

    return {
      data: bags,
      total,
      page: page || 1,
      totalPages: Math.ceil(total / (limit || 10)),
    };
  }

  async getBagById(id: string) {
    const bag = await AppDataSource.getRepository(BagEntity)
      .createQueryBuilder("bags")
      .innerJoinAndSelect("bags.categories", "categories")
      .innerJoinAndSelect("bags.bagImages", "bagImages")
      .where("bags.id = :id", { id })
      .getOne();
    if (!bag) {
      throw new ApiError(404, "Bag not found.");
    }
    return bag;
  }

  async updateBagById(id: string, bag: updateBagValidator) {
    const bagRepo = AppDataSource.getRepository(BagEntity);
    const bagImageRepo = AppDataSource.getRepository(MediaEntity);

    const existingBag = await bagRepo.findOne({
      where: { id },
      relations: { bagImages: true },
    });
    if (!existingBag) throw new ApiError(404, "Bag not found.");

    if (bag.bagImages !== undefined) {
      const newBagImages = await bagImageRepo.find({
        where: { id: In(bag.bagImages) },
      });

      // Find images to remove (those currently linked but not in newBagImages)
      const imagesToRemove = existingBag.bagImages.filter(
        (img) => !(bag.bagImages ?? []).includes(img.id)
      );

      // Remove the MediaEntity records for imagesToRemove
      if (imagesToRemove.length > 0) {
        await bagImageRepo.remove(imagesToRemove);
      }

      existingBag.bagImages = newBagImages;
    }

    await bagRepo.save(existingBag);
    return existingBag;
  }

  async deleteBagById(id: string) {
    const bag = await AppDataSource.getRepository(BagEntity).findOne({
      where: {
        id: id,
      },
    });
    if (!bag) {
      throw new ApiError(404, "Bag not found.");
    }
    await AppDataSource.getRepository(BagEntity).delete(id);
    return bag;
  }
}
