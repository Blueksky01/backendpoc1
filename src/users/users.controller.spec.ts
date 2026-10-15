import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser = {
    id: 1,
    firstName: 'สมชาย',
    lastName: 'งามขำ',
    phoneNumber: '082-872-8463',
    birthDate: '1979-08-07',
    nickname: 'พีท',
    gender: 'ชาย',
    email: 'teerapat584@hotmail.com',
    createdAt: '2026-06-02T21:55:07.000Z',
    address: {
      houseNumber: '239',
      villageNo: '-',
      village: 'สิวลี',
      road: 'กาญจนาภิเษก',
      subdistrict: 'เสาธงหิน',
      district: 'บางใหญ่',
      province: 'นนทบุรี',
      postalCode: '11140',
    },
  };

  const mockUsersService = {
    findAll: vi.fn().mockReturnValue([mockUser]),
    findOne: vi.fn().mockReturnValue(mockUser),
    create: vi.fn().mockResolvedValue(mockUser),
    update: vi.fn().mockResolvedValue(mockUser),
    remove: vi.fn().mockResolvedValue({ success: true, message: 'Deleted', user: mockUser }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should return array of users', () => {
    const result = controller.findAll({});
    expect(result).toEqual([mockUser]);
    expect(mockUsersService.findAll).toHaveBeenCalledWith({});
  });

  it('findOne should return a single user', () => {
    const result = controller.findOne(1);
    expect(result).toEqual(mockUser);
    expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
  });

  it('create should return new user', async () => {
    const result = await controller.create({
      firstName: 'สมชาย',
      lastName: 'งามขำ',
      phoneNumber: '082-872-8463',
      birthDate: '1979-08-07',
      nickname: 'พีท',
      gender: 'ชาย',
      email: 'teerapat584@hotmail.com',
    });
    expect(result).toEqual(mockUser);
    expect(mockUsersService.create).toHaveBeenCalled();
  });

  it('updatePut should return updated user', async () => {
    const result = await controller.updatePut(1, { firstName: 'สมชาย' });
    expect(result).toEqual(mockUser);
    expect(mockUsersService.update).toHaveBeenCalledWith(1, { firstName: 'สมชาย' });
  });

  it('remove should return success response', async () => {
    const result = await controller.remove(1);
    expect(result).toEqual({ success: true, message: 'Deleted', user: mockUser });
    expect(mockUsersService.remove).toHaveBeenCalledWith(1);
  });
});
