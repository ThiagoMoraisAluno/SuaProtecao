import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  IUsersRepository,
  USERS_REPOSITORY_TOKEN,
} from './interfaces/users-repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY_TOKEN)
    private readonly usersRepository: IUsersRepository,
  ) {}

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    await this.usersRepository.upsertProfile(userId, dto);
    const updated = await this.usersRepository.findById(userId);
    return updated!;
  }
}
