import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      IgnoreExpiration: true,
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: any) {
    console.log(payload);
    const currentNumericDate: number = new Date().getTime();
    if (payload.exp < currentNumericDate) {
      throw new HttpException('Token Expired', HttpStatus.UNAUTHORIZED);
    }
    return { userId: payload.user_id, username: payload.sub };
  }
}
