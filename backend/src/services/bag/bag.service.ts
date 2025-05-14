import { In } from "typeorm";
import { AppDataSource } from "../../data-source";
import { BagEntity } from "../../entities/bag/bag.entity";
import { Category } from "../../entities/category/category.entity";
import { addBagValidator } from "../../validators/addBag.validator";
import { ApiError } from "../../utils/apiError";

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

  async getAllBags() {
    const bags = await AppDataSource.getRepository(BagEntity)
      .createQueryBuilder("bags")
      .innerJoinAndSelect("bags.categories", "categories")
      .innerJoinAndSelect("bags.bagImages", "bagImages")
      .getMany();

    if (!bags) {
      throw new ApiError(404, "No bags found.");
    }
    return bags;
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
