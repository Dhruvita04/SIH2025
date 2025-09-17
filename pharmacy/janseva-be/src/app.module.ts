import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ImageService } from './utils/image.service';
import { BrandModule } from './brand/brand.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { ProfileModule } from './profile/profile.module';
import { AddressModule } from './address/address.module';
import { CommonModule } from './common/common.module';
import { CouponModule } from './coupon/coupon.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { ContactModule } from './contact/contact.module';
import { UserModule } from './user/user.module';

@Module({
  controllers: [AppController],
  providers: [AppService,ImageService],
  imports: [AuthModule, BrandModule,CategoryModule,ProductModule,CartModule,PrescriptionModule,ProfileModule,AddressModule,CommonModule,CouponModule, PaymentsModule, OrdersModule, ContactModule, UserModule],
})
export class AppModule {}
