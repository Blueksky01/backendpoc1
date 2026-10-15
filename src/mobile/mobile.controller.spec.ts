import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MobileController } from './mobile.controller.js';
import { MobileService } from './mobile.service.js';

describe('MobileController', () => {
  let controller: MobileController;

  const mockMobileService = {
    getDashboard: vi.fn().mockReturnValue({
      success: true,
      data: {
        summary: {
          totalEmployees: 10,
          activeEmployees: 9,
          inactiveEmployees: 1,
          departmentCount: 3,
        },
      },
    }),
    getFilters: vi.fn().mockReturnValue({
      success: true,
      data: {
        departments: ['Engineering'],
        statuses: ['Active'],
      },
    }),
    quickSearch: vi.fn().mockReturnValue({
      success: true,
      data: [],
    }),
    getEmployees: vi.fn().mockReturnValue({
      success: true,
      data: [],
      pagination: { page: 1, limit: 10, total: 0 },
    }),
    getEmployeeById: vi.fn().mockReturnValue({
      success: true,
      data: { id: 'EMP-31433' },
    }),
    updateStatus: vi.fn().mockResolvedValue({
      success: true,
      data: { id: 'EMP-31433', status: 'Inactive' },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MobileController],
      providers: [
        {
          provide: MobileService,
          useValue: mockMobileService,
        },
      ],
    }).compile();

    controller = module.get<MobileController>(MobileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getDashboard should call mobileService.getDashboard', () => {
    controller.getDashboard();
    expect(mockMobileService.getDashboard).toHaveBeenCalled();
  });

  it('getFilters should call mobileService.getFilters', () => {
    controller.getFilters();
    expect(mockMobileService.getFilters).toHaveBeenCalled();
  });

  it('quickSearch should call mobileService.quickSearch', () => {
    controller.quickSearch({ q: 'test' });
    expect(mockMobileService.quickSearch).toHaveBeenCalledWith({ q: 'test' });
  });

  it('getEmployees should call mobileService.getEmployees', () => {
    controller.getEmployees({ page: 1 });
    expect(mockMobileService.getEmployees).toHaveBeenCalledWith({ page: 1 });
  });

  it('getEmployee should call mobileService.getEmployeeById', () => {
    controller.getEmployee('EMP-31433');
    expect(mockMobileService.getEmployeeById).toHaveBeenCalledWith('EMP-31433');
  });

  it('updateStatus should call mobileService.updateStatus', async () => {
    await controller.updateStatus('EMP-31433', { status: 'Inactive' });
    expect(mockMobileService.updateStatus).toHaveBeenCalledWith(
      'EMP-31433',
      'Inactive',
    );
  });
});
