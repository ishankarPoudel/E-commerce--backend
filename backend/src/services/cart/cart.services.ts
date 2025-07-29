import { AppDataSource } from "../../config/data-source/data-source";
import { CartEntity } from "../../entities/cart/cart.entity";
import { CartItemEntity } from "../../entities/cart/cartItem.entity";

export class CartService {
  private cartRepo = AppDataSource.getRepository(CartEntity);
  private cartItemRepo = AppDataSource.getRepository(CartItemEntity);

  async addToCart(userId: string, bagId: string, quantity: number) {
    //finding cart by  user not by cart id
    const existingCart = await this.cartRepo.findOne({
      where: {
        user: { id: userId },
      },
      relations: ["cartItems"],
    });
    if (!existingCart) {
      const cartItem = this.cartItemRepo.create({
        bag: { id: bagId },
        quantity: quantity,
      });
      const newCart = this.cartRepo.create({
        user: { id: userId },
        cartItems: [cartItem],
      });
      await this.cartRepo.save(newCart);
    } else {
      // checking if the bag is already in the  cart
      // if yes then update bthe quantity
      let cartItem = existingCart.cartItems.find(
        (item) => item.bag.id === bagId
      );
      if (cartItem) {
        cartItem.quantity += quantity;
        await this.cartItemRepo.save(cartItem);
      } else {
        // if not, crarte new  cart item
        cartItem = this.cartItemRepo.create({
          bag: { id: bagId },
          quantity: quantity,
        });
        await this.cartItemRepo.save(cartItem);
        existingCart.cartItems.push(cartItem);
        await this.cartRepo.save(existingCart);
      }
    }
    return { existingCart };
  }
}
