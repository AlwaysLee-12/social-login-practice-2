import { Injectable } from '@nestjs/common';
import { InvalidTokenError } from 'jwt-decode';
import { map } from 'rxjs';
import { AxiosClient } from './axios-client';

@Injectable()
export class KaKaoStrategy {
  constructor(private readonly api: AxiosClient) {}

  public async ValidateTokenAndDecode(access_token: string): Promise<any> {
    const api_url = 'https://kapi.kakao.com/v2/user/me';
    const header = {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      'Authorization': `${access_token}`,
    };
    const kakaoRequestApiResult: any = this.api.Get(api_url, {
      headers: header,
    });

    return kakaoRequestApiResult;
  }
}
