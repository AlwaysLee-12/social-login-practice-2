import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AppleStrategy } from '../strategies/apple.strategy';
import { IdentityTokenSchema, ProviderDataSchema } from '../types/interfaces';

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
    const appleData: ProviderDataSchema = {
      nick_name: nick_name,
      provider: 'Apple',
    };
    request.body = { appleData: appleData };

    return true;
  }
}
