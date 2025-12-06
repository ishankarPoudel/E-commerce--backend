import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from "class-validator";

export class AddToCartValidator {
  @IsNotEmpty()
  bagId: string;

  @IsNotEmpty({ message: "Quantity is required" })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(1, { message: "Quantity must be at least 1" })
  @IsInt({ message: "Quantity must be a positive number" })
  quantity: number;

  @IsOptional()
  color?: string;

  @IsOptional()
  size?: string;
}
