import { Body, Post, Route, Tags } from "tsoa";
import { CreateCategoryValidator } from "../../validators/createCategory.validator";
import { CategoryService } from "../../services/category/category.service";

@Route("/category")
@Tags("Category")
export class CategoryController {
  @Post("/add-category")
  async addCategory(@Body() category: CreateCategoryValidator) {
    const newCategory = await new CategoryService().createCategory(category);
    return {
      success: true,
      message: "Category added successfully",
      data: newCategory,
    };
  }
}
