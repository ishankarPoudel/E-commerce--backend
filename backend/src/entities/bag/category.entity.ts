import { Entity, ManyToMany } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { BagEntity } from "./bag.entity";

@Entity()
export class Category extends CommonEntity {
  @ManyToMany(() => BagEntity, (bag) => bag.categories)
  bags: BagEntity[];
}
