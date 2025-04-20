import { Column, Entity, JoinTable } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { ManyToMany } from "typeorm";
import { Category } from "../category/category.entity";

@Entity()
export class BagEntity extends CommonEntity {
  @Column()
  name: string;

  @Column({ type: "int" })
  price: number;

  @Column({ type: "text", nullable: true })
  description: string;

  @ManyToMany(() => Category)
  @JoinTable()
  categories: Category[];
}
