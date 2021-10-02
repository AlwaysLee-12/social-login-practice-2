import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Collection } from 'src/entities/collection.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,

    private readonly jwtService: JwtService,
  ) {}
  //가드 사용전 구현 코드
  // async isValidKakaoToken(access_token_kakao: string): Promise<any> {
  //   const api_url = 'https://kapi.kakao.com/v2/user/me';
  //   const header = {
  //     'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
  //     'Authorization': `${access_token_kakao}`,
  //   };

  //   if (!access_token_kakao) {
  //     throw new UnauthorizedException();
  //   }
  //   const kakaoData: any = this.api.Get(api_url, { headers: header });

  //   return kakaoData;
  // }

  async createUser(nick_name: string, provider: string): Promise<User> {
    let user = await this.userRepository.findOne({
      nick_name: nick_name,
      provider: provider,
    });
    if (user) {
      return user;
    }
    user = new User();
    user.nick_name = nick_name;
    user.provider = provider;
    await this.userRepository.save(user);

    const collection = new Collection();
    collection.userId = user.id;
    await this.collectionRepository.save(collection);

    return user;
  }

  async login(user: User) {
    const payload = { user_id: user.id, user_name: user.nick_name };
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: '30m',
    });
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: '14d',
    });

    const currentHashedRefreshToken = await hash(refresh_token, 10);
    user.currentHashedRefreshToken = currentHashedRefreshToken;
    await this.userRepository.save(user);
    return { access_token: access_token, refresh_token: refresh_token };
  }

  async logout(user: User): Promise<void> {
    this.userRepository.update(user, { currentHashedRefreshToken: '' });
  }

  async isRefreshTokenMatching(
    refreshToken: string,
    userID: number,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ id: userID });
    const refreshTokenIsMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );
    if (refreshTokenIsMatching) return user;
    throw new UnauthorizedException();
  }

  async refresh(user: User): Promise<any> {
    const payload = { user_id: user.id, sub: user.nick_name };
    const newAccessToken = this.jwtService.sign(payload);
    return newAccessToken;
  }
}
