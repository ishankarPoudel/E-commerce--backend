import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Request,
  Route,
  Tags,
} from "tsoa";
import { AddToCartValidator } from "../../validators/cart/addToCart.validator";
import { CartService } from "../../services/cart/cart.services";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { ApiError } from "../../utils/apiError";

@Route("/cart")
@Tags("Cart")
export class CartController extends Controller {
  private getUserIdFromRequest(req: AuthenticatedRequest): string {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "User ID not found in request");
    }
    return userId;
  }
  @Post("/add-to-cart")
  async addToCart(
    @Body() cart: AddToCartValidator,
    @Request() req: AuthenticatedRequest
  ) {
    const userId = this.getUserIdFromRequest(req);
    const cartService = await new CartService().addToCart(
      userId,
      cart.bagId,
      cart.quantity
    );
    return {
      message: "Item added to cart successfully",
      data: cartService,
    };
  }

  @Delete("/remove-from-cart")
  async removeFromCart(
    @Body() cart: AddToCartValidator,
    @Request() req: AuthenticatedRequest
  ) {
    const userId = this.getUserIdFromRequest(req);
    const cartService = await new CartService().removeFromCart(
      userId,
      cart.bagId
    );
    return {
      message: "Item removed from cart successfully",
      data: cartService.cart,
    };
  }

  @Patch("/update-cart")
  async updateCart(
    @Body() cart: AddToCartValidator,
    @Request() req: AuthenticatedRequest
  ) {
    const userId = this.getUserIdFromRequest(req);
    const cartService = await new CartService().updateCartItemQuantity(
      userId,
      cart.bagId,
      cart.quantity
    );
    return {
      message: "Cart updated successfully",
      data: cartService.cart,
    };
  }

  @Get("/get-cart")
  async getCart(@Request() req: AuthenticatedRequest) {
    const userId = this.getUserIdFromRequest(req);
    const cartService = await new CartService().getCartByUserId(userId);
    return {
      message: "Cart retrieved successfully",
      data: cartService.cart,
    };
  }
}
