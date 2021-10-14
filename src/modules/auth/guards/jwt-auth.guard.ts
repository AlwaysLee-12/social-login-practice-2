import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  //주로 현재 context의 request에 접근하기 위한 용도로 boolean을 리턴
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
  //기본 오류 처리에서 보다 더 확장하고싶거나 인증 논리를 추가하려는 경우
  handleRequest(err, user, info) {
    //console.log(user + '' + info);
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid Token Error');
    }
    return user;
  }
}
