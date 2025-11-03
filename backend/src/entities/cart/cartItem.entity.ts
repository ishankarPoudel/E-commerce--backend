import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CommonEntity } from "../common/common.entity";
import { CartEntity } from "./cart.entity";
import { BagEntity } from "../bag/bag.entity";

@Entity("cart-item")
@Index("idx_cart_item_cart_id", ["cart"])
@Index("idx_cart_item_bag_id", ["bag"])
@Index("idx_cart_item_cart_bag", ["cart", "bag"])
export class CartItemEntity extends CommonEntity {
  @ManyToOne(() => CartEntity, (cart) => cart.cartItems, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "cart_id" })
  cart: CartEntity;

  @ManyToOne(() => BagEntity)
  @JoinColumn({ name: "bag_id" })
  bag: BagEntity;

  @Column({ type: "int" })
  quantity: number;
}
