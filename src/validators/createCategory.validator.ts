import { IsNotEmpty } from "class-validator";

export class CreateCategoryValidator {
  @IsNotEmpty()
  categoryName: string;
}
