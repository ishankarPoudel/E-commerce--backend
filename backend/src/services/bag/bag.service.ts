import { In } from "typeorm";
import { AppDataSource } from "../../data-source";
import { BagEntity } from "../../entities/bag/bag.entity";
import { Category } from "../../entities/category/category.entity";
import { addBagValidator } from "../../validators/addBag.validator";
import { ApiError } from "../../utils/apiError";
import { Query } from "tsoa";

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

  async getAllBags(@Query() page?: number, @Query() limit?: number) {
    const offset = ((page || 1) - 1) * (limit || 10);

    const [bags, total] = await AppDataSource.getRepository(
      BagEntity
    ).findAndCount({
      skip: offset,
      take: limit || 10,
      order: {
        createdAt: "DESC",
      },
      relations: {
        categories: true,
        bagImages: true,
      },
    });
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
