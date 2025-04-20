import { IsNotEmpty, IsOptional, Length, Min } from "class-validator";

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
}
