import { Controller, Get, Put, Req, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';
import { AppleAuthGuard } from './apple-auth.guard';
import { ApiDocs } from './auth.docs';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRefreshGuard } from './jwt-refresh-auth.guard';

@Controller('auth')
@ApiTags('Auth API')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('kakao')
  @ApiDocs.kakaoLogin('카카오 로그인')
  async kakaoLogin(@Req() req: any) {
    const kakaoUserData = await this.authService.isValidKakaoToken(
      req.headers.authorization,
    );
    if (!kakaoUserData) return;
    let user = await this.authService.validateUser(kakaoUserData.id, 'kakao');
    if (!user) {
      user = await this.authService.createUser(
        kakaoUserData.profile.kakao_account.profile.nickname,
        'kakao',
      );
    }
    return await this.authService.login(user);
  }

  @UseGuards(AppleAuthGuard)
  @Post('apple')
  async appleLogin(@Req() req: any) {
    const appleEmail: string = req.validateTokenResult.email;
    const changedAsNickName: string = appleEmail.split('@')[0];
    const userExist: boolean = await this.authService.isUserExist(
      changedAsNickName,
      'Apple',
    );
    let user: User;
    if (!userExist) {
      user = await this.authService.createUser(changedAsNickName, 'Apple');
    }
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
