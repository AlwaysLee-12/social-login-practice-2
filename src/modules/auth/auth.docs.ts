import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { AuthController } from './auth.controller';

type SwaggerMethodDoc<T> = {
  [K in keyof T]: (description: string) => MethodDecorator;
};

export const ApiDocs: SwaggerMethodDoc<AuthController> = {
  kakaoLogin(summary: string) {
    return applyDecorators(
      ApiOperation({
        summary,
        description: '카카오 로그인 API',
      }),
      ApiParam({
        name: 'req',
        required: true,
        description: '카카오 로그인 Request Body',
      }),
    );
  },
  logout(summary: string) {
    return applyDecorators(
      ApiOperation({
        summary,
        description: '로그아웃을 수행하여 리프레시 토큰 저장소에서 삭제',
      }),
      ApiParam({
        name: 'req',
        required: true,
        description: '로그아웃 Request Body에서 사용자 정보 가져옴',
      }),
    );
  },
  getProfile(summary: string) {
    return applyDecorators(
      ApiOperation({
        summary,
        description: '해당 사용자의 프로필 정보를 조회',
      }),
      ApiParam({
        name: 'req',
        required: true,
        description: '프로필 조회 Request Body에서 사용자 정보를 가져옴',
      }),
    );
  },
  refreshToken(summary: string) {
    return applyDecorators(
      ApiOperation({
        summary,
        description:
          '리프레시 토큰의 검증을 수행하고 유효하다면 엑세스 토큰을 재발급',
      }),
      ApiParam({
        name: 'req',
        required: true,
        description: '토큰 리프레시 Request Body에서 사용자 정보를 가져옴',
      }),
    );
  },
};
