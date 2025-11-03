import { Column, Entity, Index, JoinTable, OneToMany } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { ManyToMany } from "typeorm";
import { Category } from "../category/category.entity";
import { MediaEntity } from "../media/media.entity";

@Entity()
@Index("idx_bag_name", ["name"])
@Index("idx_bag_price", ["price"])
@Index("idx_bag_search_vector", { synchronize: false })
export class BagEntity extends CommonEntity {
  @Column()
  name: string;

  @Column({ type: "int" })
  price: number;

  @Column({ type: "text", nullable: true })
  description: string;

  @ManyToMany(() => Category, (category) => category.bags)
  @JoinTable({
    name: "bag_categorey_relation",
  })
  categories: Category[];

  @OneToMany(() => MediaEntity, (media) => media.bag, {
    cascade: true,
    onDelete: "CASCADE",
  })
  bagImages: MediaEntity[];

  // Full text search vector
  @Column({ select: false, type: "tsvector", nullable: true })
  search_vector: string;
}
