import { Injectable, NotFoundException } from '@nestjs/common';
import { EmployeesService } from '../employees/employees.service.js';
import { Employee, Address } from '../employees/entities/employee.entity.js';
import {
  MobileEmployeeCard,
  MobileEmployeeDetail,
  MobileDashboardData,
  MobileFilterOptions,
  MobilePaginatedResponse,
  MobileSingleResponse,
} from './interfaces/mobile.interface.js';
import {
  MobileQueryEmployeeDto,
  MobileQuickSearchDto,
} from './dto/mobile-query.dto.js';

@Injectable()
export class MobileService {
  constructor(private readonly employeesService: EmployeesService) {}

  private getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      const first = parts[0];
      const last = parts[parts.length - 1];
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  private getAvatarUrl(name: string): string {
    const encoded = encodeURIComponent(name?.trim() || 'User');
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encoded}&backgroundColor=3b82f6,10b981,8b5cf6,ec4899,f59e0b`;
  }

  private formatShortAddress(address?: Address): string {
    if (!address) return '';
    const parts = [address.district, address.province].filter(Boolean);
    return parts.join(', ');
  }

  private formatFullAddress(address?: Address): string {
    if (!address) return '';
    const parts: string[] = [];
    if (address.street) parts.push(address.street);
    if (address.subdistrict) parts.push(`แขวง/ตำบล ${address.subdistrict}`);
    if (address.district) parts.push(`เขต/อำเภอ ${address.district}`);
    if (address.province) parts.push(`จังหวัด ${address.province}`);
    if (address.postalCode) parts.push(address.postalCode);
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }

  private toMobileCard(employee: Employee): MobileEmployeeCard {
    return {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      status: employee.status,
      avatarUrl: this.getAvatarUrl(employee.name),
      initials: this.getInitials(employee.name),
      shortAddress: this.formatShortAddress(employee.address),
    };
  }

  private toMobileDetail(employee: Employee): MobileEmployeeDetail {
    const card = this.toMobileCard(employee);
    const fullAddress = this.formatFullAddress(employee.address);
    const mapQuery = fullAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
      : '';

    return {
      ...card,
      address: employee.address,
      fullAddress,
      actions: {
        canEmail: Boolean(employee.email),
        mailtoUrl: employee.email ? `mailto:${employee.email}` : '',
        mapQuery,
      },
    };
  }

  private getAllRawEmployees(): Employee[] {
    const res = this.employeesService.findAll({});
    if (Array.isArray(res)) {
      return res;
    }
    return (res as { data: Employee[] }).data ?? [];
  }

  getEmployees(query: MobileQueryEmployeeDto): MobilePaginatedResponse<MobileEmployeeCard> {
    const all = this.getAllRawEmployees();
    let filtered = [...all];

    if (query.department) {
      const dept = query.department.toLowerCase().trim();
      filtered = filtered.filter(
        (e) => e.department?.toLowerCase() === dept,
      );
    }

    if (query.status) {
      const status = query.status.toLowerCase().trim();
      filtered = filtered.filter(
        (e) => e.status?.toLowerCase() === status,
      );
    }

    if (query.search) {
      const s = query.search.toLowerCase().trim();
      filtered = filtered.filter((e) => {
        const addr = e.address;
        return (
          e.id?.toLowerCase().includes(s) ||
          e.name?.toLowerCase().includes(s) ||
          e.email?.toLowerCase().includes(s) ||
          e.department?.toLowerCase().includes(s) ||
          e.status?.toLowerCase().includes(s) ||
          addr?.district?.toLowerCase().includes(s) ||
          addr?.province?.toLowerCase().includes(s)
        );
      });
    }

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, query.limit ?? 10);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const pageItems = filtered.slice(startIndex, startIndex + limit);

    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      success: true,
      data: pageItems.map((emp) => this.toMobileCard(emp)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: hasPreviousPage ? page - 1 : null,
      },
      timestamp: new Date().toISOString(),
    };
  }

  getEmployeeById(id: string): MobileSingleResponse<MobileEmployeeDetail> {
    const employee = this.employeesService.findOne(id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return {
      success: true,
      data: this.toMobileDetail(employee),
      timestamp: new Date().toISOString(),
    };
  }

  getDashboard(): MobileSingleResponse<MobileDashboardData> {
    const all = this.getAllRawEmployees();
    const totalEmployees = all.length;

    const statusCounts: Record<string, number> = {};
    const departmentCounts: Record<string, number> = {};

    for (const emp of all) {
      const status = emp.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      const dept = emp.department || 'Other';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    }

    const activeEmployees = statusCounts['Active'] || 0;
    const inactiveEmployees = (statusCounts['Inactive'] || 0) + (statusCounts['On Leave'] || 0);

    const departments = Object.entries(departmentCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const recentEmployees = all.slice(0, 5).map((e) => this.toMobileCard(e));

    return {
      success: true,
      data: {
        summary: {
          totalEmployees,
          activeEmployees,
          inactiveEmployees,
          departmentCount: departments.length,
        },
        departments,
        recentEmployees,
        statusBreakdown: statusCounts,
      },
      timestamp: new Date().toISOString(),
    };
  }

  getFilters(): MobileSingleResponse<MobileFilterOptions> {
    const all = this.getAllRawEmployees();
    const departmentSet = new Set<string>();
    const statusSet = new Set<string>();

    for (const emp of all) {
      if (emp.department) departmentSet.add(emp.department);
      if (emp.status) statusSet.add(emp.status);
    }

    return {
      success: true,
      data: {
        departments: Array.from(departmentSet).sort(),
        statuses: Array.from(statusSet).sort(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  quickSearch(query: MobileQuickSearchDto): MobileSingleResponse<MobileEmployeeCard[]> {
    const q = (query.q || '').toLowerCase().trim();
    const limit = Math.max(1, query.limit ?? 8);
    const all = this.getAllRawEmployees();

    if (!q) {
      return {
        success: true,
        data: all.slice(0, limit).map((e) => this.toMobileCard(e)),
        timestamp: new Date().toISOString(),
      };
    }

    const matched = all
      .filter((e) => {
        return (
          e.name?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q) ||
          e.id?.toLowerCase().includes(q) ||
          e.department?.toLowerCase().includes(q)
        );
      })
      .slice(0, limit);

    return {
      success: true,
      data: matched.map((e) => this.toMobileCard(e)),
      timestamp: new Date().toISOString(),
    };
  }

  async updateStatus(
    id: string,
    status: string,
  ): Promise<MobileSingleResponse<MobileEmployeeDetail>> {
    const updated = await this.employeesService.update(id, { status });
    return {
      success: true,
      data: this.toMobileDetail(updated),
      timestamp: new Date().toISOString(),
    };
  }
}
