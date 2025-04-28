import { Column, Entity, ManyToOne } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { BagEntity } from "../bag/bag.entity";

@Entity()
export class MediaEntity extends CommonEntity {
  @Column()
  url: string;

  @Column({ nullable: true })
  altText?: string;

  @ManyToOne(() => BagEntity, (bag) => bag.bagImages, { onDelete: "CASCADE" })
  bag: BagEntity;
}
