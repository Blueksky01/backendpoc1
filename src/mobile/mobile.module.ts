import { Module } from '@nestjs/common';
import { EmployeesModule } from '../employees/employees.module.js';
import { MobileController } from './mobile.controller.js';
import { MobileService } from './mobile.service.js';

@Module({
  imports: [EmployeesModule],
  controllers: [MobileController],
  providers: [MobileService],
  exports: [MobileService],
})
export class MobileModule {}
