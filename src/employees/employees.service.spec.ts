import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { EmployeesService } from './employees.service.js';

describe('EmployeesService', () => {
  let service: EmployeesService;

  beforeEach(async () => {
    service = new EmployeesService();
    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all 50 employees initially', () => {
    const result = service.findAll();
    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result.length).toBe(50);
    }
  });

  it('findAll with pagination should return paginated data', () => {
    const result = service.findAll({ page: 1, limit: 10 });
    expect('data' in result).toBe(true);
    if ('data' in result) {
      expect(result.data.length).toBe(10);
      expect(result.total).toBe(50);
      expect(result.totalPages).toBe(5);
      expect(result.page).toBe(1);
    }
  });

  it('findAll with search should filter results by name, email, department or address', () => {
    const result = service.findAll({ search: 'สมชาย' });
    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((e) => e.name.includes('สมชาย'))).toBe(true);
    }
  });

  it('findAll with department filter should return matched department only', () => {
    const result = service.findAll({ department: 'Engineering' });
    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((e) => e.department.toLowerCase() === 'engineering')).toBe(true);
    }
  });

  it('findAll with status filter should return matched status only', () => {
    const result = service.findAll({ status: 'Active' });
    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((e) => e.status.toLowerCase() === 'active')).toBe(true);
    }
  });

  it('findOne should return employee when id exists', () => {
    const employee = service.findOne('EMP-31433');
    expect(employee).toBeDefined();
    expect(employee.id).toBe('EMP-31433');
    expect(employee.name).toBe('สมชาย ศรีเจริญ');
  });

  it('findOne should throw NotFoundException when id does not exist', () => {
    expect(() => service.findOne('EMP-9999999')).toThrow(NotFoundException);
  });
});
