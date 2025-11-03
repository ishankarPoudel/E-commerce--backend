import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { UserEntity } from "../user/userInfo/user.userInfo.entity";
import { CartItemEntity } from "../cart/cartItem.entity";
import { OrderItemEntity } from "./orderItems.entity";

@Entity({ name: "orders" })
@Index("idx_order_user_id", ["user"])
@Index("idx_order_status", ["status"])
@Index("idx_order_created_at", ["createdAt"])
@Index("idx_order_stripe_payment_intent", ["stripePaymentIntentId"])
export class OrderEntity extends CommonEntity {
  @ManyToOne(() => UserEntity, (user) => user.orders)
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @Column({ default: "pending" })
  status!: "pending" | "paid" | "failed" | "refunded";

  @Column({ default: "delivery" })
  deliveryMethod!: "delivery" | "pickup";

  @Column({ default: "USD" })
  currency!: string;

  @Column({ type: "integer" })
  amount!: number;

  @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true })
  items?: OrderItemEntity[];

  @Column({ nullable: true })
  stripePaymentIntentId?: string;

  @Column({ nullable: true })
  stripeChargeId?: string;

  @Column({ type: "jsonb", nullable: true })
  itemsSnapShot?: unknown;
}
