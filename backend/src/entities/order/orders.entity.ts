import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { UserEntity } from "../user/userInfo/user.userInfo.entity";

@Entity({ name: "orders" })
export class OrderEntity extends CommonEntity {
  @ManyToOne(() => UserEntity, (user) => user.orders)
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @Column({ default: "pending" })
  status!: "pending" | "paid" | "failed" | "refunded";

  @Column({ nullable: true })
  stripePaymentIntentId?: string;

  @Column({ nullable: true })
  stripeChargeId?: string;
}
