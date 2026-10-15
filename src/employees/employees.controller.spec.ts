import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmployeesController } from './employees.controller.js';
import { EmployeesService } from './employees.service.js';

describe('EmployeesController', () => {
  let controller: EmployeesController;

  const mockEmployee = {
    id: 'EMP-31433',
    name: 'สมชาย ศรีเจริญ',
    email: 'somchai.sri18@example.com',
    department: 'Engineering',
    status: 'Active',
    address: {
      street: '36/22 ถนนสุขุมวิท',
      subdistrict: 'คลองเตย',
      district: 'คลองเตย',
      province: 'กรุงเทพมหานคร',
      postalCode: '10110',
    },
  };

  const mockEmployeesService = {
    findAll: vi.fn().mockReturnValue([mockEmployee]),
    findOne: vi.fn().mockReturnValue(mockEmployee),
    create: vi.fn().mockResolvedValue(mockEmployee),
    update: vi.fn().mockResolvedValue(mockEmployee),
    remove: vi.fn().mockResolvedValue({
      success: true,
      message: 'Deleted',
      employee: mockEmployee,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should return array of employees', () => {
    const result = controller.findAll({});
    expect(result).toEqual([mockEmployee]);
    expect(mockEmployeesService.findAll).toHaveBeenCalledWith({});
  });

  it('findOne should return a single employee', () => {
    const result = controller.findOne('EMP-31433');
    expect(result).toEqual(mockEmployee);
    expect(mockEmployeesService.findOne).toHaveBeenCalledWith('EMP-31433');
  });

  it('create should return new employee', async () => {
    const result = await controller.create({
      name: 'สมชาย ศรีเจริญ',
      email: 'somchai.sri18@example.com',
      department: 'Engineering',
      status: 'Active',
    });
    expect(result).toEqual(mockEmployee);
    expect(mockEmployeesService.create).toHaveBeenCalled();
  });

  it('updatePut should return updated employee', async () => {
    const result = await controller.updatePut('EMP-31433', {
      name: 'สมชาย ศรีเจริญ',
    });
    expect(result).toEqual(mockEmployee);
    expect(mockEmployeesService.update).toHaveBeenCalledWith('EMP-31433', {
      name: 'สมชาย ศรีเจริญ',
    });
  });

  it('updatePatch should return updated employee', async () => {
    const result = await controller.updatePatch('EMP-31433', {
      status: 'Inactive',
    });
    expect(result).toEqual(mockEmployee);
    expect(mockEmployeesService.update).toHaveBeenCalledWith('EMP-31433', {
      status: 'Inactive',
    });
  });

  it('remove should return success response', async () => {
    const result = await controller.remove('EMP-31433');
    expect(result).toEqual({
      success: true,
      message: 'Deleted',
      employee: mockEmployee,
    });
    expect(mockEmployeesService.remove).toHaveBeenCalledWith('EMP-31433');
  });
});
