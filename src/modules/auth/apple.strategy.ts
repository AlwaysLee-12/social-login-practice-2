import { UnauthorizedException } from '@nestjs/common';
import * as jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import jwtDecode, { InvalidTokenError, JwtHeader } from 'jwt-decode';
import { AxiosClient } from './axios-client';

export class AppleStrategy {
  private readonly audience: string;
  constructor(private readonly api: AxiosClient) {
    this.audience = 'client_id';
  }

  public async ValidateTokenAndDecode(identity_token: string): Promise<any> {
    const tokenDecodedHeader: JwtHeader & { kid: string } = jwtDecode<
      JwtHeader & { kid: string }
    >(identity_token, {
      header: true,
    });
    const applePublicKeys: { keys: Array<{ [key: string]: string }> } =
      await this.api.Get('https://appleid.apple.com/auth/keys');
    const client: jwksClient.JwksClient = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
    });
    const kid: string = tokenDecodedHeader.kid;
    const validKid: string = applePublicKeys.keys.filter(
      (element) => element['kid'] === kid,
    )[0]?.['kid'];
    const key: jwksClient.CertSigningKey | jwksClient.RsaSigningKey =
      await client.getSigningKey(validKid);
    const publicKey: string = key.getPublicKey();

    if (!publicKey) {
      throw new UnauthorizedException();
    }
    try {
      const result: any = jwt.verify(identity_token, publicKey);
      this.ValidateToken(result);

      return result;
    } catch (err) {
      throw new Error();
    }
  }

  private ValidateToken(token): void {
    if (token.iss !== 'https://appleid.apple.com') {
      throw new InvalidTokenError();
    }
    if (token.aud !== this.audience) {
      throw new InvalidTokenError();
    }
  }
}
