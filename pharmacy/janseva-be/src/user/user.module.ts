// src/users/user.module.ts

import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { PrismaService } from '../prisma/prisma.service'
import { ImageService } from '../utils/image.service'

@Module({
  imports: [],             // or PrismaModule if you have one
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,         // make sure PrismaService is here
    ImageService,          // ← register ImageService so it can be injected
  ],
  exports: [UserService],  // export if other modules need to use it
})
export class UserModule {}
