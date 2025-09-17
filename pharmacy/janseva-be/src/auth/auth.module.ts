import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { OtpModule } from './otp/otp.module';
import { ConfigModule } from '@nestjs/config';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Ensure to set JWT_SECRET in .env
      signOptions: { expiresIn: '1d' },
    }),
    OtpModule,
  ],
  providers: [AuthService, PrismaService, LocalStrategy, JwtStrategy, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, PassportModule, RolesGuard],
})
export class AuthModule {}