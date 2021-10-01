import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AppleStrategy, IdentityTokenSchema } from './apple.strategy';

export interface AppleDataSchema {
  nick_name: string;
  provider: string;
}

@Injectable()
export class AppleAuthGuard implements CanActivate {
  constructor(private readonly apple: AppleStrategy) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token: string = <string>request.headers.identify_token();
    if (!token) throw new UnauthorizedException();

    const validateTokenResult: IdentityTokenSchema =
      await this.apple.ValidateTokenAndDecode(token);

    const nick_name: string = validateTokenResult.email.split('@')[0];
    const appleData: AppleDataSchema = {
      nick_name: nick_name,
      provider: 'Apple',
    };
    request.body = { appleData: appleData };

    return true;
  }
}
