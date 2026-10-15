import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { QueryEmployeeDto } from './dto/query-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { Employee } from './entities/employee.entity.js';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class EmployeesService implements OnModuleInit {
  private readonly logger = new Logger(EmployeesService.name);
  private readonly filePath = path.resolve(process.cwd(), 'employees.json');
  private employees: Employee[] = [];

  async onModuleInit(): Promise<void> {
    await this.loadEmployees();
  }

  private async loadEmployees(): Promise<void> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      this.employees = JSON.parse(data) as Employee[];
      this.logger.log(`Loaded ${this.employees.length} employees from employees.json`);
    } catch (error) {
      this.logger.error(
        `Failed to load employees.json: ${(error as Error).message}`,
      );
      this.employees = [];
    }
  }

  private async saveEmployees(): Promise<void> {
    try {
      await fs.writeFile(
        this.filePath,
        JSON.stringify(this.employees, null, 2),
        'utf-8',
      );
    } catch (error) {
      this.logger.error(
        `Failed to save employees.json: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  private generateEmployeeId(): string {
    let id: string;
    do {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      id = `EMP-${randomNum}`;
    } while (this.employees.some((e) => e.id === id));
    return id;
  }

  findAll(
    query?: QueryEmployeeDto,
  ): Employee[] | PaginatedResult<Employee> {
    let result = [...this.employees];

    if (query?.department) {
      const dept = query.department.toLowerCase().trim();
      result = result.filter(
        (e) => e.department?.toLowerCase() === dept,
      );
    }

    if (query?.status) {
      const status = query.status.toLowerCase().trim();
      result = result.filter(
        (e) => e.status?.toLowerCase() === status,
      );
    }

    if (query?.search) {
      const s = query.search.toLowerCase().trim();
      result = result.filter((e) => {
        const address = e.address;
        return (
          e.id?.toLowerCase().includes(s) ||
          e.name?.toLowerCase().includes(s) ||
          e.email?.toLowerCase().includes(s) ||
          e.department?.toLowerCase().includes(s) ||
          e.status?.toLowerCase().includes(s) ||
          address?.street?.toLowerCase().includes(s) ||
          address?.subdistrict?.toLowerCase().includes(s) ||
          address?.district?.toLowerCase().includes(s) ||
          address?.province?.toLowerCase().includes(s) ||
          address?.postalCode?.toLowerCase().includes(s)
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

  findOne(id: string): Employee {
    const employee = this.employees.find((e) => e.id === id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const newId = createEmployeeDto.id?.trim() || this.generateEmployeeId();

    if (this.employees.some((e) => e.id === newId)) {
      throw new ConflictException(`Employee with ID ${newId} already exists`);
    }

    const newEmployee: Employee = {
      id: newId,
      name: createEmployeeDto.name,
      email: createEmployeeDto.email,
      department: createEmployeeDto.department,
      status: createEmployeeDto.status,
      address: createEmployeeDto.address
        ? Object.assign({}, createEmployeeDto.address)
        : undefined,
    };

    this.employees.unshift(newEmployee);
    await this.saveEmployees();
    return newEmployee;
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employeeIndex = this.employees.findIndex((e) => e.id === id);
    if (employeeIndex === -1) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const existingEmployee = this.employees[employeeIndex];
    const updatedAddress = updateEmployeeDto.address
      ? Object.assign({}, existingEmployee.address, updateEmployeeDto.address)
      : existingEmployee.address;

    const updatedEmployee: Employee = Object.assign(
      {},
      existingEmployee,
      updateEmployeeDto,
      {
        address: updatedAddress,
      },
    );

    this.employees[employeeIndex] = updatedEmployee;
    await this.saveEmployees();
    return updatedEmployee;
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string; employee: Employee }> {
    const employeeIndex = this.employees.findIndex((e) => e.id === id);
    if (employeeIndex === -1) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const [deletedEmployee] = this.employees.splice(employeeIndex, 1);
    await this.saveEmployees();
    return {
      success: true,
      message: `Employee with ID ${id} has been deleted`,
      employee: deletedEmployee,
    };
  }
}
