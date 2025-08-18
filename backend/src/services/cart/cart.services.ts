import { AppDataSource } from "../../config/data-source/data-source";
import { CartEntity } from "../../entities/cart/cart.entity";
import { CartItemEntity } from "../../entities/cart/cartItem.entity";
import { ApiError } from "../../utils/apiError";

export class CartService {
  private cartRepo = AppDataSource.getRepository(CartEntity);
  private cartItemRepo = AppDataSource.getRepository(CartItemEntity);

  async addToCart(userId: string, bagId: string, quantity: number) {
    if (!quantity || quantity <= 0) throw new ApiError(400, "Invalid quantity");

    return await AppDataSource.transaction(
      async (transactionalEntityManager) => {
        const cartRepo = transactionalEntityManager.getRepository(CartEntity);
        const cartItemRepo =
          transactionalEntityManager.getRepository(CartItemEntity);

        // STEP 1: Find and lock the cart WITHOUT relations
        let cart = await cartRepo.findOne({
          where: { user: { id: userId } },
          lock: { mode: "pessimistic_write" },
        });

        // If the cart doesn't exist, create it
        if (!cart) {
          cart = cartRepo.create({ user: { id: userId } });
          await cartRepo.save(cart);
        }

        // STEP 2: Find the specific item now that the cart is locked
        let existingItem = await cartItemRepo.findOne({
          where: {
            cart: { id: cart.id },
            bag: { id: bagId },
          },
        });

        if (existingItem) {
          existingItem.quantity = quantity;
          await cartItemRepo.save(existingItem);
        } else {
          const newItem = cartItemRepo.create({
            cart: { id: cart.id },
            bag: { id: bagId },
            quantity,
          });
          await cartItemRepo.save(newItem);
        }

        // STEP 3: Reload the full cart to return the final state
        return await cartRepo.findOne({
          where: { id: cart.id },
          relations: ["cartItems", "cartItems.bag"],
        });
      }
    );
  }

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
      relations: ["cartItems", "cartItems.bag", "cartItems.bag.bagImages"],
    });
    if (!cart) throw new ApiError(404, "Cart not found");
    return {
      cart,
    };
  }
}
