import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { DocsController } from './docs.controller.js';
import { DocsService } from './docs.service.js';

describe('DocsController', () => {
  let controller: DocsController;
  let service: DocsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocsController],
      providers: [DocsService],
    }).compile();

    controller = module.get<DocsController>(DocsController);
    service = module.get<DocsService>(DocsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getApiHubHtml should return HTML document string', () => {
    const html = controller.getApiHubHtml();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('API Hub');
  });

  it('getCatalogJson should return catalog object with categories', () => {
    const catalog = controller.getCatalogJson();
    expect(catalog).toHaveProperty('info');
    expect(catalog.categories).toContain('Mobile');
    expect(catalog.categories).toContain('Employees');
    expect(catalog.categories).toContain('Auth');
    expect(catalog.totalEndpoints).toBeGreaterThan(0);
  });
});
