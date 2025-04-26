import { AppDataSource } from "../../data-source";
import { Category } from "../../entities/category/category.entity";
import { ApiError } from "../../utils/apiError";
import { CreateCategoryValidator } from "../../validators/createCategory.validator";

export class CategoryService {
  async createCategory(category: CreateCategoryValidator) {
    const categoryRepo = AppDataSource.getRepository(Category);
    const existingCategory = await categoryRepo.findOne({
      where: {
        categoryName: category.categoryName,
      },
    });
    if (existingCategory) {
      throw new ApiError(409, "Category already exists");
    }

    const newCategory = new Category();
    newCategory.categoryName = category.categoryName;
    const savedCategory = await categoryRepo.save(newCategory);
    return savedCategory;
  }

  async getAllCategories() {
    const categoryRepo = AppDataSource.getRepository(Category);
    const categories = await categoryRepo.find();
    if (!categories || categories.length === 0) {
      throw new ApiError(404, "No categories found");
    }
    return categories;
  }
}
