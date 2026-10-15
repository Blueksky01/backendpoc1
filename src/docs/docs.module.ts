import { Module } from '@nestjs/common';
import { DocsController } from './docs.controller.js';
import { DocsService } from './docs.service.js';

@Module({
  controllers: [DocsController],
  providers: [DocsService],
  exports: [DocsService],
})
export class DocsModule {}
