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
  authorizeRoles,
  revalidateUser,
} from "../../middlewares/auth.middleware";
import { ApiError } from "../../utils/apiError";
import { UserRole } from "../../entities/user/userInfo/user.userInfo.entity";

@Route("/cart")
@Tags("Cart")
export class CartController extends Controller {
  @Post("/add-to-cart")
  @Middlewares(
    authenticateToken,
    revalidateUser,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
  )
  async addToCart(
    @Body() cart: AddToCartValidator,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user!.id;
    const cartService = await new CartService().addToCart(
      userId,
      cart.bagId,
      cart.quantity,
      cart.color,
      cart.size,
    );
    return {
      message: "Item added to cart successfully",
      data: cartService,
    };
  }

  @Delete("/remove-from-cart")
  @Middlewares(
    authenticateToken,
    revalidateUser,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
  )
  async removeFromCart(
    @Body() cart: { bagId: string; userId?: string },
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user!.id;
    const cartService = await new CartService().removeFromCart(
      userId,
      cart.bagId,
    );
    return {
      message: "Item removed from cart successfully",
      data: cartService,
    };
  }

  @Patch("/update-cart")
  @Middlewares(
    authenticateToken,
    revalidateUser,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
  )
  async updateCart(
    @Body() cart: { bagId: string; quantity: number },
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    const cartService = await new CartService().updateCartItemQuantity(
      cart.bagId,
      cart.quantity,
    );

    return {
      message: "Cart updated successfully",
      data: cartService.cart,
    };
  }

  @Get("/get-cart")
  @Middlewares(
    authenticateToken,
    revalidateUser,
    authorizeRoles(UserRole.USER, UserRole.ADMIN),
  )
  async getCart(@Request() req: AuthenticatedRequest) {
    const userId = req.user!.id;
    const cartService = await new CartService().getCartByUserId(userId);
    return {
      message: "Cart retrieved successfully",
      data: cartService.cart,
    };
  }
}
