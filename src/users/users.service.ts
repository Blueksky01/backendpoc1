import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CreateUserDto } from './dto/create-user.dto.js';
import { QueryUserDto } from './dto/query-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  private readonly filePath = path.resolve(process.cwd(), 'users.json');
  private users: User[] = [];

  async onModuleInit(): Promise<void> {
    await this.loadUsers();
  }

  private async loadUsers(): Promise<void> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      this.users = JSON.parse(data) as User[];
      this.logger.log(`Loaded ${this.users.length} users from users.json`);
    } catch (error) {
      this.logger.error(`Failed to load users.json: ${(error as Error).message}`);
      this.users = [];
    }
  }

  private async saveUsers(): Promise<void> {
    try {
      await fs.writeFile(
        this.filePath,
        JSON.stringify(this.users, null, 2),
        'utf-8',
      );
    } catch (error) {
      this.logger.error(`Failed to save users.json: ${(error as Error).message}`);
      throw error;
    }
  }

  findAll(query?: QueryUserDto): User[] | { data: User[]; total: number; page: number; limit: number; totalPages: number } {
    let result = [...this.users];

    if (query?.search) {
      const s = query.search.toLowerCase().trim();
      result = result.filter((u) => {
        const address = u.address;
        return (
          u.firstName?.toLowerCase().includes(s) ||
          u.lastName?.toLowerCase().includes(s) ||
          u.nickname?.toLowerCase().includes(s) ||
          u.phoneNumber?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s) ||
          address?.village?.toLowerCase().includes(s) ||
          address?.road?.toLowerCase().includes(s) ||
          address?.subdistrict?.toLowerCase().includes(s) ||
          address?.district?.toLowerCase().includes(s) ||
          address?.province?.toLowerCase().includes(s)
        );
      });
    }

    if (query?.page !== undefined || query?.limit !== undefined) {
      const page = Math.max(1, query?.page ?? 1);
      const limit = Math.max(1, query?.limit ?? 10);
      const total = result.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const data = result.slice(startIndex, startIndex + limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages,
      };
    }

    return result;
  }

  findOne(id: number): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const maxId = this.users.reduce((max, u) => Math.max(max, u.id || 0), 0);
    const newUser: User = {
      id: maxId + 1,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phoneNumber: createUserDto.phoneNumber,
      birthDate: createUserDto.birthDate,
      nickname: createUserDto.nickname,
      gender: createUserDto.gender,
      email: createUserDto.email,
      createdAt: new Date().toISOString(),
      address: createUserDto.address
        ? Object.assign({}, createUserDto.address)
        : undefined,
    };

    this.users.unshift(newUser);
    await this.saveUsers();
    return newUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const existingUser = this.users[userIndex];
    const updatedAddress = updateUserDto.address
      ? Object.assign({}, existingUser.address, updateUserDto.address)
      : existingUser.address;

    const updatedUser: User = Object.assign({}, existingUser, updateUserDto, {
      address: updatedAddress,
    });

    this.users[userIndex] = updatedUser;
    await this.saveUsers();
    return updatedUser;
  }

  async remove(id: number): Promise<{ success: boolean; message: string; user: User }> {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const [deletedUser] = this.users.splice(userIndex, 1);
    await this.saveUsers();
    return {
      success: true,
      message: `User with ID ${id} has been deleted`,
      user: deletedUser,
    };
  }
}
