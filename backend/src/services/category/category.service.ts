import AppDataSource from "../../config/data-source/data-source";
import { Category } from "../../entities/category/category.entity";
import { ApiError } from "../../utils/apiError";
import { CreateCategoryValidator } from "../../validators/createCategory.validator";

export class CategoryService {
  private categoryRepo = AppDataSource.getRepository(Category);

  async createCategory(category: CreateCategoryValidator) {
    const existingCategory = await this.categoryRepo.findOne({
      where: {
        categoryName: category.categoryName,
      },
    });
    if (existingCategory) {
      throw new ApiError(409, "Category already exists");
    }

    const newCategory = new Category();
    newCategory.categoryName = category.categoryName;
    const savedCategory = await this.categoryRepo.save(newCategory);
    return savedCategory;
  }

  async getAllCategories() {
    const categories = await this.categoryRepo.find();
    if (!categories || categories.length === 0) {
      throw new ApiError(404, "No categories found");
    }
    return categories;
  }

  async deleteCategoryById(id: string) {
    const categoryExits = await this.categoryRepo.findOne({
      where: {
        id: id,
      },
    });
    if (!categoryExits) {
      throw new ApiError(404, "Category not found");
    }
    const deletedCategory = await this.categoryRepo.delete(id);
    if (deletedCategory.affected === 0) {
      throw new ApiError(500, "Failed to delete category");
    }
    return deletedCategory;
  }

  async getCategoriesWithBags(page: number, limit: number) {
    const [categories, total] = await this.categoryRepo
      .createQueryBuilder("category")
      .innerJoinAndSelect("category.bags", "product")
      .leftJoinAndSelect("product.images", "images")
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy("category.createdAt", "DESC")
      .getManyAndCount();
    if (!categories || categories.length === 0) {
      throw new ApiError(
        404,
        "No bags associated with any of the categories found"
      );
    }
    return {
      data: categories,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
