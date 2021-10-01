import { Injectable } from '@nestjs/common';
import * as jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import jwtDecode, { InvalidTokenError } from 'jwt-decode';
import { AxiosClient } from '../axios-client';
import { IdentityTokenHeader, IdentityTokenSchema } from '../types/interfaces';
import { ApplePublicKeyType } from '../types/type-alias';

@Injectable()
export class AppleStrategy {
  private readonly audience: string;
  constructor(private readonly api: AxiosClient) {
    this.audience = 'client_id';
  }
  public async ValidateTokenAndDecode(
    identity_token: string,
  ): Promise<IdentityTokenSchema> {
    const tokenDecodedHeader: IdentityTokenHeader =
      jwtDecode<IdentityTokenHeader>(identity_token, {
        header: true,
      });

    const applePublicKeys: ApplePublicKeyType = await this.api.Get(
      'https://appleid.apple.com/auth/keys',
    );
    const client: jwksClient.JwksClient = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
    });
    const kid: string = tokenDecodedHeader.kid;
    const alg: string = tokenDecodedHeader.alg;
    const validKid: string = applePublicKeys.keys.filter(
      (element) => element['kid'] === kid && element['alg'] === alg,
    )[0]?.['kid'];
    const key: jwksClient.CertSigningKey | jwksClient.RsaSigningKey =
      await client.getSigningKey(validKid);
    const publicKey: string = key.getPublicKey();

    if (!publicKey) {
      throw new InvalidTokenError();
    }
    try {
      const result: IdentityTokenSchema = jwt.verify(
        identity_token,
        publicKey,
      ) as IdentityTokenSchema;
      this.ValidateToken(result);

      return result;
    } catch (err) {
      throw new Error();
    }
  }

  private ValidateToken(token: IdentityTokenSchema): void {
    if (token.iss !== 'https://appleid.apple.com') {
      throw new InvalidTokenError();
    }
    if (token.aud !== this.audience) {
      throw new InvalidTokenError();
    }
  }
}
