import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { CartEntity } from "./cart.entity";
import { BagEntity } from "../bag/bag.entity";

@Entity("cart-item")
export class CartItemEntity extends CommonEntity {
  @ManyToOne(() => CartEntity, (cart) => cart.cartItems)
  @JoinColumn({ name: "cart_id" })
  cart: CartEntity;

  @ManyToOne(() => BagEntity)
  @JoinColumn({ name: "bag_id" })
  bag: BagEntity;

  @Column({ type: "int" })
  quantity: number;
}
