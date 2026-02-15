import { Body, Get, Middlewares, Post, Query, Route, Tags } from "tsoa";
import { CreateCategoryValidator } from "../../validators/createCategory.validator";
import { CategoryService } from "../../services/category/category.service";
import {
  authenticateToken,
  authorizeRoles,
} from "../../middlewares/auth.middleware";
import { UserRole } from "../../entities/user/userInfo/user.userInfo.entity";

@Route("/category")
@Tags("Category")
export class CategoryController {
  @Post("/add-category")
  @Middlewares(authenticateToken, authorizeRoles(UserRole.ADMIN))
  async addCategory(@Body() category: CreateCategoryValidator) {
    const newCategory = await new CategoryService().createCategory(category);
    return {
      success: true,
      message: "Category added successfully",
      data: newCategory,
    };
  }

  @Get("/get-categories")
  async getCategories() {
    const categories = await new CategoryService().getAllCategories();
    return {
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    };
  }

  @Get("/get-categories-with-bags")
  async getCategoriesWithBags(@Query() page: number, @Query() limit: number) {
    const categories = await new CategoryService().getCategoriesWithBags(
      page,
      limit,
    );
    return {
      success: true,
      message: "Categories with bags fetched successfully",
      data: categories,
    };
  }
}
