import {
  Body,
  Controller,
  Delete,
  Get,
  Middlewares,
  Patch,
  Post,
  Request,
  Route,
  Tags,
} from "tsoa";
import { AddToCartValidator } from "../../validators/cart/addToCart.validator";
import { CartService } from "../../services/cart/cart.services";
import {
  AuthenticatedRequest,
  authenticateToken,
  revalidateUser,
} from "../../middlewares/auth.middleware";
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
  @Middlewares(authenticateToken, revalidateUser)
  async addToCart(
    @Body() cart: AddToCartValidator,
    @Request() req: AuthenticatedRequest
  ) {
    const userId = this.getUserIdFromRequest(req);
    const cartService = await new CartService().addToCart(
      userId,
      cart.bagId,
      cart.quantity,
      cart.color,
      cart.size
    );
    return {
      message: "Item added to cart successfully",
      data: cartService,
    };
  }

  @Delete("/remove-from-cart")
  async removeFromCart(
    @Body() cart: { bagId: string; userId?: string },
    @Request() req: AuthenticatedRequest
  ) {
    const userId = this.getUserIdFromRequest(req);
    const cartService = await new CartService().removeFromCart(
      userId,
      cart.bagId
    );
    return {
      message: "Item removed from cart successfully",
      data: cartService,
    };
  }

  @Patch("/update-cart")
  async updateCart(
    @Body() cart: { bagId: string; quantity: number },
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
