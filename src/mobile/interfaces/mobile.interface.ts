import type { Address } from '../../employees/entities/employee.entity.js';

export interface MobileEmployeeCard {
  id: string;
  name: string;
  email: string;
  department: string;
  status: string;
  avatarUrl: string;
  initials: string;
  shortAddress: string;
}

export interface MobileEmployeeDetail extends MobileEmployeeCard {
  address?: Address;
  fullAddress: string;
  actions: {
    canEmail: boolean;
    mailtoUrl: string;
    mapQuery: string;
  };
}

export interface MobilePaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

export interface MobilePaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: MobilePaginationMeta;
  timestamp: string;
}

export interface MobileSingleResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface DepartmentStat {
  name: string;
  count: number;
}

export interface MobileDashboardData {
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    departmentCount: number;
  };
  departments: DepartmentStat[];
  recentEmployees: MobileEmployeeCard[];
  statusBreakdown: Record<string, number>;
}

export interface MobileFilterOptions {
  departments: string[];
  statuses: string[];
}
