import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiDocs } from './users.docs';
import { UserService } from './users.service';

@Controller('users')
@ApiTags('User API')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiDocs.findUsers('모든 사용자 조회')
  findUsers() {
    return this.userService.findAllUser();
  }

  @Get('/:id')
  @ApiDocs.findUserById('사용자 조회')
  findUserById(@Param('id') id: number) {
    return this.userService.findUserById(id);
  }

  @Delete('/:id')
  @ApiDocs.delete('사용자 삭제')
  delete(@Param('id') id: number) {
    return this.userService.deleteById(id);
  }
}
