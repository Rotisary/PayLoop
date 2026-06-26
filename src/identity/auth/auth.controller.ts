import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { type AuthenticatedMerchant } from '../../common/types/auth/authenticated-merchant.type';
import { CurrentMerchant } from '../../common/decorators/jwt-auth.decorator';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({summary: 'Create merchant acccount'})
  @ApiCreatedResponse({ type: AuthResponseDto })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Authenticate user',
    description: "Merchant passes email and password. They are validated and a token pair is returned.",
  })
  @ApiOkResponse({ type: AuthResponseDto })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh',
    description: 'Get new jwt authentication credentials when existing one expires',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout of dashboard',
    description: 'takes in the refresh token, blacklists existing token and logs out ',
  })
  @ApiOkResponse({ schema: { example: { success: true } } })
  logout(@Body() dto: RefreshTokenDto, @CurrentMerchant() merchant: AuthenticatedMerchant) {
    return this.authService.logout(dto, merchant);
  }
}
