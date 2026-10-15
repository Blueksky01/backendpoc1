import { Controller, Get, Header } from '@nestjs/common';
import { DocsService } from './docs.service.js';
import type { ApiCatalogResponse } from './interfaces/api-endpoint.interface.js';

@Controller(['docs', 'api-docs', 'api'])
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  getApiHubHtml(): string {
    return this.docsService.getHtmlPage();
  }

  @Get('catalog')
  getCatalogJson(): ApiCatalogResponse {
    return this.docsService.getCatalog();
  }

  @Get('json')
  getJsonSpec(): ApiCatalogResponse {
    return this.docsService.getCatalog();
  }
}
