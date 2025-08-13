import { AppDataSource } from "../../config/data-source/data-source";
import { CartEntity } from "../../entities/cart/cart.entity";
import { CartItemEntity } from "../../entities/cart/cartItem.entity";
import { ApiError } from "../../utils/apiError";

export class CartService {
  private cartRepo = AppDataSource.getRepository(CartEntity);
  private cartItemRepo = AppDataSource.getRepository(CartItemEntity);

  // ...existing code...
  async addToCart(userId: string, bagId: string, quantity: number) {
    if (!quantity || quantity <= 0) throw new ApiError(400, "Invalid quantity");

    return await AppDataSource.transaction(
      async (transactionalEntityManager) => {
        const cartRepo = transactionalEntityManager.getRepository(CartEntity);
        const cartItemRepo =
          transactionalEntityManager.getRepository(CartItemEntity);

        // STEP 1: Find the cart and LOCK the row for writing
        // This is the key to preventing the race condition.
        let cart = await cartRepo.findOne({
          where: { user: { id: userId } },
          relations: ["cartItems", "cartItems.bag"],
          lock: {
            mode: "pessimistic_write",
          },
        });

        // If cart doesn't exist, create it. Locking doesn't apply here.
        if (!cart) {
          const newCartItem = cartItemRepo.create({
            bag: { id: bagId },
            quantity,
          });
          cart = cartRepo.create({
            user: { id: userId },
            cartItems: [newCartItem],
          });
          await cartRepo.save(cart);
          return cart;
        }

        // STEP 2: Now that the cart is locked, safely find the item
        const existingItem = cart.cartItems.find(
          (item) => item.bag?.id === bagId
        );

        if (existingItem) {
          // Item exists, update quantity
          existingItem.quantity += quantity;
          await cartItemRepo.save(existingItem);
        } else {
          // Item does not exist, create a new one
          const newItem = cartItemRepo.create({
            bag: { id: bagId },
            quantity,
            cart: { id: cart.id }, // Explicitly link to the cart
          });
          await cartItemRepo.save(newItem);
        }

        // STEP 3: Reload the cart to return the final, correct state
        return await cartRepo.findOne({
          where: { id: cart.id },
          relations: ["cartItems", "cartItems.bag"],
        });
      }
    );
  }
  // ...existing code...

  async removeFromCart(userId: string, bagId: string) {
    const cart = await this.cartRepo.findOne({
      where: {
        user: { id: userId },
        cartItems: { bag: { id: bagId } },
      },
      relations: ["cartItems", "cartItems.bag"],
    });
    if (!cart) throw new ApiError(404, "Cart not found");

    await this.cartItemRepo.remove(cart.cartItems);
    return {
      cart,
    };
  }

  async updateCartItemQuantity(
    userId: string,
    bagId: string,
    quantity: number
  ) {
    const cart = await this.cartRepo.findOne({
      where: {
        user: { id: userId },
        cartItems: { bag: { id: bagId } },
      },
      relations: ["cartItems", "cartItems.bag"],
    });
    if (!cart) throw new ApiError(404, "Cart not found");
    const cartItem = cart.cartItems.find((item) => item.bag.id === bagId);
    if (!cartItem) throw new ApiError(404, "Cart item not found");
    if (quantity <= 0) {
      await this.cartItemRepo.remove(cartItem);
      cart.cartItems = cart.cartItems.filter((item) => item.id !== cartItem.id);
    } else {
      cartItem.quantity = quantity;
      await this.cartItemRepo.save(cartItem);
    }
    return {
      cart,
    };
  }

  async getCartByUserId(userId: string) {
    const cart = await this.cartRepo.findOne({
      where: {
        user: { id: userId },
      },
      relations: ["cartItems", "cartItems.bag"],
    });
    if (!cart) throw new ApiError(404, "Cart not found");
    return {
      cart,
    };
  }
}
