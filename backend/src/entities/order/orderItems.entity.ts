import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { OrderEntity } from "./orders.entity";
import { BagEntity } from "../bag/bag.entity";

@Entity({ name: "order_items" })
export class OrderItemEntity extends CommonEntity {
  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order!: OrderEntity;

  @ManyToOne(() => BagEntity, { eager: true })
  @JoinColumn({ name: "bag_id" })
  bag!: BagEntity;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ type: "int" })
  unitPrice!: number;
}
