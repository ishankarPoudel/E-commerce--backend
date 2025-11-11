import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { BagEntity } from "../bag/bag.entity";

@Entity()
export class MediaEntity extends CommonEntity {
  @Column()
  image: string;

  @Column({ nullable: true })
  altText?: string;

  @ManyToOne(() => BagEntity, (bag) => bag.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "products" })
  bag: BagEntity;
}
