import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { OrderEntity } from "./orders.entity";
import { BagEntity } from "../bag/bag.entity";

@Entity({ name: "order_items" })
@Index("idx_order_item_order_id", ["order"])
@Index("idx_order_item_bag_id", ["bag"])
export class OrderItemEntity extends CommonEntity {
  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order!: OrderEntity;

  @ManyToOne(() => BagEntity, { eager: false })
  @JoinColumn({ name: "bag_id" })
  bag!: BagEntity;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ type: "int" })
  unitPrice!: number;
}
