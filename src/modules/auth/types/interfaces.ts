import { JwtHeader, JwtPayload } from 'jwt-decode';

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

export interface ProviderDataSchema {
  nick_name: string;
  provider: string;
}
