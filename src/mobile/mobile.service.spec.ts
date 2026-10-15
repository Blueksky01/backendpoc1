import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MobileService } from './mobile.service.js';
import { EmployeesService } from '../employees/employees.service.js';
import { NotFoundException } from '@nestjs/common';

describe('MobileService', () => {
  let service: MobileService;

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

  const mockInactiveEmployee = {
    id: 'EMP-99002',
    name: 'วิภาดา แสงสว่าง',
    email: 'wiphada.sae59@example.com',
    department: 'Finance',
    status: 'Inactive',
    address: {
      street: '38/49 ถนนสาทรใต้',
      subdistrict: 'ทุ่งมหาเมฆ',
      district: 'สาทร',
      province: 'กรุงเทพมหานคร',
      postalCode: '10120',
    },
  };

  const mockEmployees = [mockEmployee, mockInactiveEmployee];

  const mockEmployeesService = {
    findAll: vi.fn().mockReturnValue(mockEmployees),
    findOne: vi.fn((id: string) => {
      const found = mockEmployees.find((e) => e.id === id);
      if (!found) throw new NotFoundException();
      return found;
    }),
    update: vi.fn((id: string, updateDto: any) => {
      return Promise.resolve({
        ...mockEmployee,
        ...updateDto,
      });
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobileService,
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    service = module.get<MobileService>(MobileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEmployees', () => {
    it('should return mobile-friendly paginated employee list', () => {
      const res = service.getEmployees({ page: 1, limit: 10 });
      expect(res.success).toBe(true);
      expect(res.data.length).toBe(2);
      expect(res.data[0]).toHaveProperty('id', 'EMP-31433');
      expect(res.data[0]).toHaveProperty('avatarUrl');
      expect(res.data[0]).toHaveProperty('initials');
      expect(res.data[0]).toHaveProperty('shortAddress', 'คลองเตย, กรุงเทพมหานคร');
      expect(res.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
        nextPage: null,
        previousPage: null,
      });
    });

    it('should filter by department and status', () => {
      const res = service.getEmployees({ department: 'engineering', status: 'active' });
      expect(res.data.length).toBe(1);
      expect(res.data[0].id).toBe('EMP-31433');
    });

    it('should filter by search keyword', () => {
      const res = service.getEmployees({ search: 'วิภาดา' });
      expect(res.data.length).toBe(1);
      expect(res.data[0].name).toBe('วิภาดา แสงสว่าง');
    });
  });

  describe('getEmployeeById', () => {
    it('should return formatted detail with action helpers', () => {
      const res = service.getEmployeeById('EMP-31433');
      expect(res.success).toBe(true);
      expect(res.data.id).toBe('EMP-31433');
      expect(res.data.fullAddress).toContain('36/22 ถนนสุขุมวิท');
      expect(res.data.actions.canEmail).toBe(true);
      expect(res.data.actions.mailtoUrl).toBe('mailto:somchai.sri18@example.com');
      expect(res.data.actions.mapQuery).toContain('google.com/maps');
    });
  });

  describe('getDashboard', () => {
    it('should return mobile dashboard aggregation', () => {
      const res = service.getDashboard();
      expect(res.success).toBe(true);
      expect(res.data.summary.totalEmployees).toBe(2);
      expect(res.data.summary.activeEmployees).toBe(1);
      expect(res.data.summary.inactiveEmployees).toBe(1);
      expect(res.data.departments).toEqual([
        { name: 'Engineering', count: 1 },
        { name: 'Finance', count: 1 },
      ]);
      expect(res.data.recentEmployees.length).toBe(2);
    });
  });

  describe('getFilters', () => {
    it('should return unique departments and statuses for mobile filter chips', () => {
      const res = service.getFilters();
      expect(res.success).toBe(true);
      expect(res.data.departments).toEqual(['Engineering', 'Finance']);
      expect(res.data.statuses).toEqual(['Active', 'Inactive']);
    });
  });

  describe('quickSearch', () => {
    it('should return matching items', () => {
      const res = service.quickSearch({ q: 'somchai', limit: 5 });
      expect(res.success).toBe(true);
      expect(res.data.length).toBe(1);
      expect(res.data[0].id).toBe('EMP-31433');
    });
  });

  describe('updateStatus', () => {
    it('should update status and return mobile detail', async () => {
      const res = await service.updateStatus('EMP-31433', 'Inactive');
      expect(res.success).toBe(true);
      expect(mockEmployeesService.update).toHaveBeenCalledWith('EMP-31433', {
        status: 'Inactive',
      });
    });
  });
});
