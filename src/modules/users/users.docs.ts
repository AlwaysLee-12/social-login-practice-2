import { applyDecorators } from '@nestjs/common';
import { UserController } from './users.controller';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

type SwaggerMethodDoc<T> = {
  [K in keyof T]: (description: string) => MethodDecorator;
};

export const ApiDocs: SwaggerMethodDoc<UserController> = {
  findUsers(summary: string) {
    return applyDecorators(
      ApiOperation({
        summary,
        description: '모든 유저들의 정보를 조회',
      }),
    );
  },
  findUserById(summary: string) {
    return applyDecorators(
      ApiOperation({
        summary,
        description: '해당 아이디를 가진 사용자의 정보를 조회',
      }),
      ApiParam({
        name: 'id',
        required: true,
        description: '사용자의 아이디',
      }),
    );
  },
  delete(summary: string) {
    return applyDecorators(
      ApiOperation({
        summary,
        description: '해당 아이디를 가진 사용자를 삭제',
      }),
      ApiParam({
        name: 'id',
        required: true,
        description: '사용자의 아이디',
      }),
    );
  },
};
