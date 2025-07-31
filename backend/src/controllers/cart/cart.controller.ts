import { Body, Controller, Post, Route, Tags } from "tsoa";
import { AddToCartValidator } from "../../validators/cart/addToCart.validator";

Route("/cart");
Tags("Cart");
export class CartController extends Controller {
  @Post("/add-to-cart")
  async addToCart(@Body() cart: AddToCartValidator) {}
}
