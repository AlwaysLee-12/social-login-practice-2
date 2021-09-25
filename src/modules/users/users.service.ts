import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findUserById(id: number): Promise<User> {
    return await this.userRepository.findOne({ id: id });
  }

  async findAllUser(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async deleteById(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ id: id });
    await this.userRepository.delete(user);
  }

  async createUser(
    provider_id: number,
    nick_name: string,
    provider: string,
  ): Promise<User> {
    const user = this.userRepository.create({
      provider_id: provider_id,
      nick_name: nick_name,
      provider: provider,
    });
    return await this.userRepository.save(user);
  }
}
