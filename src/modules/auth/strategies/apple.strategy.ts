import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import jwtDecode from 'jwt-decode';
import { AxiosClient } from '../axios-client';
import { IdentityTokenHeader, IdentityTokenSchema } from '../types/interfaces';
import { ApplePublicKeyType } from '../types/interfaces';

@Injectable()
export class AppleStrategy {
  private readonly audience: string;
  private readonly issue: string;
  constructor(private readonly api: AxiosClient) {
    this.audience = 'com.yourname.meetU';
    this.issue = 'https://appleid.apple.com';
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
    if (!validKid) {
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    }

    const key: jwksClient.CertSigningKey | jwksClient.RsaSigningKey =
      await client.getSigningKey(validKid);
    const publicKey: string = key.getPublicKey();

    try {
      const result: IdentityTokenSchema = jwt.verify(
        identity_token,
        publicKey,
      ) as IdentityTokenSchema;
      //console.log(result);
      this.ValidateToken(result);

      return result;
    } catch (err) {
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    }
  }

  private ValidateToken(token: IdentityTokenSchema): void {
    if (token.iss !== this.issue) {
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    }
    if (token.aud !== this.audience) {
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    }
  }
}
