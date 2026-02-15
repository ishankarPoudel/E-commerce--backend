import { Column, Entity, JoinTable, OneToMany } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { ManyToMany } from "typeorm";
import { Category } from "../category/category.entity";
import { MediaEntity } from "../media/media.entity";
import { IsObject, IsOptional } from "class-validator";

export enum BagType {
  HANDBAG = "handbag",
  BACKPACK = "backpack",
  DUFFEL = "duffel",
  TOTE = "tote",
  CROSSBODY = "crossbody",
  LAPTOP_BAG = "laptop_bag",
  LUGGAGE = "luggage",
  SUITCASE = "suitcase",
  TRAVEL_SET = "travel_set",
  SCHOOL_BAG = "school_bag",
}

@Entity({ name: "products" })
export class BagEntity extends CommonEntity {
  @Column()
  name: string;

  @Column({ type: "enum", enum: BagType, default: BagType.HANDBAG })
  type: BagType;

  @Column({ type: "int" })
  price: number;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  material: string;

  @Column("text", { array: true, nullable: true })
  colors: string[];

  @Column("text", { array: true, nullable: true })
  sizes: string[];

  @Column({ type: "float", nullable: true })
  weightKg: number;

  @Column({ type: "float", nullable: true })
  capacityLiters: number;

  @Column({ default: false })
  isFeatured: boolean;

  @ManyToMany(() => Category, (category) => category.bags, { cascade: true })
  @JoinTable({
    name: "product_category_relation",
  })
  categories: Category[];

  @IsOptional()
  @Column({ type: "jsonb", nullable: true })
  features: Record<string, boolean>;

  @OneToMany(() => MediaEntity, (media) => media.bag, {
    onDelete: "CASCADE",
  })
  images: MediaEntity[];

  @Column({ select: false, type: "tsvector", nullable: true })
  search_vector: string;
}
