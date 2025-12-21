import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { UserEntity } from "../user/userInfo/user.userInfo.entity";
import { CartItemEntity } from "../cart/cartItem.entity";
import { OrderItemEntity } from "./orderItems.entity";

@Entity({ name: "orders" })
export class OrderEntity extends CommonEntity {
  @ManyToOne(() => UserEntity, (user) => user.orders)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @Column({ default: "pending" })
  status: "pending" | "paid" | "failed" | "refunded";

  @Column({ default: "new" })
  orderStatus: "new" | "processing" | "cancelled" | "completed";

  @Column({ default: "delivery" })
  deliveryMethod: "delivery" | "pickup";

  @Column({ default: "USD" })
  currency: string;

  @Column({ type: "integer" })
  amount: number;

  @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true })
  items?: OrderItemEntity[];

  @Column({ nullable: true })
  paymentProvider?: "stripe" | "esewa";

  @Column({ nullable: true, unique: true })
  esewaTransactionUuid?: string;

  @Column({ nullable: true })
  esewaRefId?: string;

  @Column({ nullable: true })
  esewaStatus?: "PENDING" | "COMPLETE" | "FAILED";

  @Column({ nullable: true })
  stripePaymentIntentId?: string;

  @Column({ nullable: true })
  stripeChargeId?: string;

  @Column({ type: "jsonb", nullable: true })
  itemsSnapShot?: unknown;

  @Column({ nullable: true }) // true for pickup orders
  shippingAddress?: string;
}
