import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

export interface IUsersRepository {
  findById(id: string): Promise<UserResponseDto | null>;
  upsertProfile(id: string, data: UpdateUserDto): Promise<void>;
}

export const USERS_REPOSITORY_TOKEN = 'USERS_REPOSITORY';
