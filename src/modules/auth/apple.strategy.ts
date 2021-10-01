import { Injectable } from '@nestjs/common';
import * as jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import jwtDecode, {
  InvalidTokenError,
  JwtHeader,
  JwtPayload,
} from 'jwt-decode';
import { AxiosClient } from './axios-client';

//병합은 타입 별칭보다 인터페이스가 성능이 더 좋기에 인터페이스로
//JwtPayload 인터페이스에 이미 aud, iss 등의 프로퍼티가 존재하기에 extends해서 새로운 인터페이스를 만듦
export interface IdentityTokenSchema extends JwtPayload {
  nonce: string;
  c_hash: string;
  email: string;
  email_verified: string;
  is_private_email: string;
  auth_time: number;
}

//JwtHeader에는 type, alg 프로퍼티가 있기에 extends해서 kid 프로퍼티 추가
export interface IdentityTokenHeader extends JwtHeader {
  kid: string;
}

//{ keys: Array<{ [key: string]: string }> }
export type ApplePublicKeyType = {
  keys: Array<{
    [key: string]: string;
  }>;
};

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
