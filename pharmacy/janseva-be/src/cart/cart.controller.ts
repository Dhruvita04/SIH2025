 import { Body, Controller, Delete, Post, Put, Patch } from "@nestjs/common";
import { CartService } from "./cart.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { SyncCartDto } from "./dto/sync-cart.dto";
import { DeleteCartItemDto } from "./dto/delete-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart.dto";
import type { GetCartDataDto } from "./dto/get-cart-data.dto"

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) {
    }

    @Post('add')
    async addToCart(@Body() data: AddToCartDto) {
        return this.cartService.addToCart(data);
    }

    @Put('update-quantity')
    async updateCartItem(@Body() data: UpdateCartItemDto) {
        return this.cartService.updateCartItem(data);
    }

    @Post('sync')
    async syncCart(@Body() data: SyncCartDto) {
        return this.cartService.syncCart(data);
    }

    @Delete('remove')
    async deleteCartItem(@Body() data: DeleteCartItemDto) {
        return this.cartService.deleteCartItem(data);
    }
    @Patch('change-prescription')
    async changePrescription(@Body() body: { userId: string; prescriptionId: string | null }) {
        return this.cartService.changePrescription(body.userId, body.prescriptionId)
  }
    @Post("get-data")
    async getCartData( @Body() data: GetCartDataDto) {
    return this.cartService.getCartData(data.data)
  }
}
