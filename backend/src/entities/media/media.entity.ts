import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { BagEntity } from "../bag/bag.entity";

@Entity("media")
export class MediaEntity extends CommonEntity {
  @Column()
  url: string; // Cloudinary secure_url

  @Column({ nullable: true })
  publicId: string; // Cloudinary public_id (for deletion)

  @Column({ nullable: true })
  altText?: string;

  @Column({ nullable: true })
  format?: string; // jpg, png, webp

  @Column({ type: "int", nullable: true })
  width?: number;

  @Column({ type: "int", nullable: true })
  height?: number;

  @Column({ type: "int", nullable: true })
  bytes?: number; // File size

  @Column({ type: "int", default: 0 })
  sortOrder: number; // For ordering images

  @ManyToOne(() => BagEntity, (bag) => bag.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "bag_id" })
  bag: BagEntity;
}
