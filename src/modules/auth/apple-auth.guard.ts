import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AppleStrategy } from './apple.strategy';

export class AppleAuthGuard implements CanActivate {
  constructor(private readonly apple: AppleStrategy) {}

  public async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const token: string = <string>request.body.identify_token();
    if (!token) throw new Error();

    const validateTokenResult: any = await this.apple.ValidateTokenAndDecode(
      token,
    );
    try {
    } catch (err) {
      throw new Error();
    }
    return validateTokenResult;
  }
}
