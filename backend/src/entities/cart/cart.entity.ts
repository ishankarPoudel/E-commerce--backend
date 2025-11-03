import { Entity, Index, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { UserEntity } from "../user/userInfo/user.userInfo.entity";
import { CartItemEntity } from "./cartItem.entity";

@Entity("cart")
@Index("idx_cart_user_id", ["user"])
export class CartEntity extends CommonEntity {
  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.cart, {
    cascade: true,
  })
  cartItems: CartItemEntity[];
}
