import { Body, Controller, Get, Post, Route, Tags } from "tsoa";
import { addBagValidator } from "../../validators/addBag.validator";
import { BagService } from "../../services/bag/bag.service";

@Route("/bag")
@Tags("Bag")
export class BagController extends Controller {
  @Post("/add-bag")
  async addBag(@Body() bag: addBagValidator) {
    const newBag = await new BagService().addBag(bag);
    return { success: true, message: "Bag added successfully", data: newBag };
  }

  @Get("/get-all-bags")
  async getAllBags() {
    const bags = await new BagService().getAllBags();
    return {
      success: true,
      message: "Bags retrieved successfully",
      data: bags,
    };
  }
}
