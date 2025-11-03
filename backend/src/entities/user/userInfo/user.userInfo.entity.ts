import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { CommonEntity } from "../../common/common.entity";
import { DeviceInfoEntity } from "../deviceInfo/user.deveiceInfo.entity";
import { CartEntity } from "../../cart/cart.entity";
import { OrderEntity } from "../../order/orders.entity";

@Entity()
@Index("idx_user_email", ["email"])
@Index("idx_user_email_verification_token", ["emailVerificationToken"])
export class UserEntity extends CommonEntity {
  @Column({ nullable: true })
  googleId: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: false })
  isOauth: boolean;

  @Column({ nullable: true })
  provider: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ type: "timestamp", nullable: true })
  emailVerificationTokenExpiresAt: Date | null;

  @Column({ nullable: true, type: "varchar", length: 255 })
  refreshToken: string;

  @OneToOne(() => DeviceInfoEntity, {
    cascade: true,
    eager: false,
  })
  @JoinColumn()
  deviceInfo: DeviceInfoEntity;

  @OneToOne(() => CartEntity, {
    cascade: true,
    eager: false,
  })
  @JoinColumn()
  cart: CartEntity;

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders!: OrderEntity[];
}
