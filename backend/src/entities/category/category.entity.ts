import { Column, Entity, ManyToMany } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { BagEntity } from "../bag/bag.entity";
import { IsNotEmpty } from "class-validator";

@Entity()
export class Category extends CommonEntity {
  @Column()
  @IsNotEmpty()
  categoryName: string;

  @ManyToMany(() => BagEntity, (bag) => bag.categories)
  bags: BagEntity[];
}
