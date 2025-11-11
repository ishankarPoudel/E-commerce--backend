import { IsNotEmpty, IsObject, IsOptional, Length, Min } from "class-validator";
import { BagType } from "../entities/bag/bag.entity";

export class addBagValidator {
  @IsNotEmpty()
  @Length(3, 20)
  name: string;

  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsOptional()
  @Length(0, 200)
  description: string;

  @IsNotEmpty()
  categories: string[];

  @IsOptional()
  brand: string;

  @IsOptional()
  material: string;

  @IsOptional()
  colors: string[];

  @IsOptional()
  sizes: string[];

  @IsOptional()
  weightKg: number;

  @IsOptional()
  capacityLiters: number;

  @IsOptional()
  isFeatured: boolean;

  @IsNotEmpty()
  type: BagType;

  @IsOptional()
  @IsObject()
  features: Record<string, boolean>;
}
