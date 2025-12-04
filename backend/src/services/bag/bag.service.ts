import { In } from "typeorm";

import { BagEntity } from "../../entities/bag/bag.entity";
import { Category } from "../../entities/category/category.entity";
import { addBagValidator } from "../../validators/addBag.validator";
import { ApiError } from "../../utils/apiError";
import { updateBagValidator } from "../../validators/updateBag.validator";
import { MediaEntity } from "../../entities/media/media.entity";
import AppDataSource from "../../config/data-source/data-source";

export class BagService {
  async addBag(bag: addBagValidator) {
    const newBag = new BagEntity();
    newBag.name = bag.name;
    newBag.type = bag.type;
    newBag.price = bag.price;
    newBag.description = bag.description;
    newBag.brand = bag.brand;
    newBag.material = bag.material;
    newBag.colors = bag.colors;
    newBag.sizes = bag.sizes;
    newBag.weightKg = bag.weightKg;
    newBag.capacityLiters = bag.capacityLiters;
    newBag.isFeatured = bag.isFeatured || false;
    newBag.features = bag.features || {};

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
      .leftJoinAndSelect("bag.images", "images")
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
      const categoryIds = Array.isArray(category) ? category : [category];
      queryBuilder.andWhere("categories.id IN (:...categoryIds)", {
        categoryIds,
      });
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
      .createQueryBuilder("product")
      .innerJoinAndSelect("product.categories", "categories")
      .innerJoinAndSelect("product.images", "images")
      .where("product.id = :id", { id })
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
      relations: { images: true },
    });
    if (!existingBag) throw new ApiError(404, "Bag not found.");

    if (bag.bagImages !== undefined) {
      const newBagImages = await bagImageRepo.find({
        where: { id: In(bag.bagImages) },
      });

      // Find images to remove (those currently linked but not in newBagImages)
      const imagesToRemove = existingBag.images.filter(
        (img) => !(bag.bagImages ?? []).includes(img.id)
      );

      // Remove the MediaEntity records for imagesToRemove
      if (imagesToRemove.length > 0) {
        await bagImageRepo.remove(imagesToRemove);
      }

      existingBag.images = newBagImages;
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

  async searchBags(query: string) {
    const bagRepo = AppDataSource.getRepository(BagEntity);
    const q = (query ?? "").trim();
    if (!q) return [];

    return bagRepo
      .createQueryBuilder("bag")
      .leftJoinAndSelect("bag.bagImages", "bagImages")
      .leftJoinAndSelect("bag.categories", "categories")
      .where(
        `
        to_tsvector('english',
          coalesce(bag.name,'') || ' ' ||
          coalesce(bag.description,'')
        ) @@ websearch_to_tsquery('english', :q)
      `,
        { q }
      )
      .addSelect(
        `
        ts_rank(
          to_tsvector('english',
            coalesce(bag.name,'') || ' ' ||
            coalesce(bag.description,'')
          ),
          websearch_to_tsquery('english', :q)
        )
      `,
        "rank"
      )
      .orderBy("rank", "DESC")
      .limit(20)
      .getMany();
  }

  async getBagsByCategoryId(categoryId: string) {
    const bags = await AppDataSource.getRepository(BagEntity)
      .createQueryBuilder("bag")
      .innerJoin("bag.categories", "category", "category.id = :categoryId", {
        categoryId,
      })
      .leftJoinAndSelect("bag.bagImages", "bagImages")
      .leftJoinAndSelect("bag.categories", "categories")
      .getMany();
    if (bags.length === 0) {
      return [];
    }
    return bags;
  }
}
