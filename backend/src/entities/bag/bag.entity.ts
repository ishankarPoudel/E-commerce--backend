import { Column, Entity, JoinTable, OneToMany } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { ManyToMany } from "typeorm";
import { Category } from "../category/category.entity";
import { MediaEntity } from "../media/media.entity";

@Entity()
export class BagEntity extends CommonEntity {
  @Column()
  name: string;

  @Column({ type: "int" })
  price: number;

  @Column({ type: "text", nullable: true })
  description: string;

  @ManyToMany(() => Category)
  @JoinTable({
    name: "bag_categorey_relation",
  })
  categories: Category[];

  @OneToMany(() => MediaEntity, (media) => media.bag, {
    cascade: true,
    onDelete: "CASCADE",
  })
  bagImages: MediaEntity[];
}
