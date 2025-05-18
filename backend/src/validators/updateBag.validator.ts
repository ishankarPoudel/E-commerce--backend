import { IsNotEmpty, IsOptional, Length, Min } from "class-validator";

export class updateBagValidator {
  @IsOptional()
  @Length(3, 20)
  name?: string;

  @IsOptional()
  @Min(0)
  price?: number;

  @IsOptional()
  @Length(0, 200)
  description?: string;

  @IsOptional()
  categories?: string[];

  @IsOptional()
  bagImages?: string[];
}
