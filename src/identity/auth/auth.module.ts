import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [ConfigModule, JwtModule.register({}), PassportModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
