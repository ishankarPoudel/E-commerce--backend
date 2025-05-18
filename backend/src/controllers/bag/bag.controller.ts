import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Query,
  Route,
  Tags,
} from "tsoa";
import { addBagValidator } from "../../validators/addBag.validator";
import { BagService } from "../../services/bag/bag.service";
import { updateBagValidator } from "../../validators/updateBag.validator";

@Route("/bag")
@Tags("Bag")
export class BagController extends Controller {
  @Post("/add-bag")
  async addBag(@Body() bag: addBagValidator) {
    const newBag = await new BagService().addBag(bag);
    return { success: true, message: "Bag added successfully", data: newBag };
  }

  @Get("/get-all-bags")
  async getAllBags(@Query() page?: number, @Query() limit?: number) {
    const bags = await new BagService().getAllBags(page, limit);
    return {
      success: true,
      message: "Bags retrieved successfully",
      data: bags,
    };
  }

  @Patch("/update-bag/:id")
  async updateBag(@Path() id: string, @Body() bag: updateBagValidator) {
    const updatedBag = await new BagService().updateBagById(id, bag);
    return {
      success: true,
      message: "Bag updated successfully",
      data: updatedBag,
    };
  }

  @Delete("/delete-bag/:id")
  async deleteBagById(@Path() id: string) {
    const bag = await new BagService().deleteBagById(id);
    return {
      success: true,
      message: "Bag deleted successfully",
      data: bag,
    };
  }
}
