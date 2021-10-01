import { Controller, Get, Put, Req, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppleAuthGuard, AppleDataSchema } from './apple-auth.guard';
import { ApiDocs } from './auth.docs';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRefreshGuard } from './jwt-refresh-auth.guard';
import { KakaoAuthGuard } from './kakao-auth.guard';

@Controller('auth')
@ApiTags('Auth API')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(KakaoAuthGuard)
  @Get('kakao')
  @ApiDocs.kakaoLogin('카카오 로그인')
  async kakaoLogin(@Req() req: any) {
    const kakaoData: any = req.body.kakaoData;
    const user = await this.authService.createUser(
      kakaoData.nick_name,
      kakaoData.provider,
    );
    return await this.authService.login(user);
  }

  @UseGuards(AppleAuthGuard)
  @Post('apple')
  @ApiDocs.appleLogin('애플 로그인')
  async appleLogin(@Req() req: any) {
    const appleData: AppleDataSchema = req.body.appleData;
    const user = await this.authService.createUser(
      appleData.nick_name,
      appleData.provider,
    );
    return this.authService.login(user);
  }

  @Put('logout')
  @ApiDocs.logout('로그아웃')
  async logout(@Req() req: any): Promise<void> {
    this.authService.logout(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiDocs.getProfile('프로필 조회')
  getProfile(@Req() req: any) {
    return req.user;
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  @ApiDocs.refreshToken('토큰 리프레시')
  refreshToken(@Req() req: any) {
    const newAccessToken = this.authService.refresh(req.user);
    return { access_token: newAccessToken };
  }
}
