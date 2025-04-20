import { In } from "typeorm";
import { AppDataSource } from "../../data-source";
import { BagEntity } from "../../entities/bag/bag.entity";
import { Category } from "../../entities/bag/category.entity";
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
}
