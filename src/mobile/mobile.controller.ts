import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { MobileService } from './mobile.service.js';
import {
  MobileQueryEmployeeDto,
  MobileQuickSearchDto,
} from './dto/mobile-query.dto.js';
import { UpdateMobileStatusDto } from './dto/mobile-status.dto.js';
import type {
  MobileDashboardData,
  MobileEmployeeCard,
  MobileEmployeeDetail,
  MobileFilterOptions,
  MobilePaginatedResponse,
  MobileSingleResponse,
} from './interfaces/mobile.interface.js';

@Controller(['mobile', 'api/mobile', 'api/v1/mobile'])
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  /**
   * Mobile Home / Dashboard BFF endpoint
   * Returns overview metrics, department distribution, and recent employees
   */
  @Get('dashboard')
  getDashboard(): MobileSingleResponse<MobileDashboardData> {
    return this.mobileService.getDashboard();
  }

  /**
   * Filter choices for mobile chips / dropdown sheets
   */
  @Get('filters')
  getFilters(): MobileSingleResponse<MobileFilterOptions> {
    return this.mobileService.getFilters();
  }

  /**
   * Instant search / autocomplete for mobile searchbars
   */
  @Get('search')
  quickSearch(
    @Query() query: MobileQuickSearchDto,
  ): MobileSingleResponse<MobileEmployeeCard[]> {
    return this.mobileService.quickSearch(query);
  }

  /**
   * Paginated list for mobile infinite scroll and pull-to-refresh
   */
  @Get('employees')
  getEmployees(
    @Query() query: MobileQueryEmployeeDto,
  ): MobilePaginatedResponse<MobileEmployeeCard> {
    return this.mobileService.getEmployees(query);
  }

  /**
   * Detailed view for single employee screen with contact actions & mapped address
   */
  @Get('employees/:id')
  getEmployee(
    @Param('id') id: string,
  ): MobileSingleResponse<MobileEmployeeDetail> {
    return this.mobileService.getEmployeeById(id);
  }

  /**
   * Quick status switch/action sheet from mobile UI
   */
  @Patch('employees/:id/status')
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateMobileStatusDto,
  ): Promise<MobileSingleResponse<MobileEmployeeDetail>> {
    return this.mobileService.updateStatus(id, dto.status);
  }
}
