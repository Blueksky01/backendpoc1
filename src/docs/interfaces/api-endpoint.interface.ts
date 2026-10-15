export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ParamDefinition {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string | number | boolean;
}

export interface ApiEndpointItem {
  id: string;
  method: HttpMethod;
  path: string;
  category: 'Mobile' | 'Employees' | 'Auth' | 'System';
  title: string;
  description: string;
  authRequired: boolean;
  pathParams?: ParamDefinition[];
  queryParams?: ParamDefinition[];
  requestBody?: Record<string, unknown>;
  responseExample?: unknown;
  sampleCurl: string;
}

export interface ApiCatalogGroup {
  category: string;
  icon: string;
  description: string;
  endpoints: ApiEndpointItem[];
}

export interface ApiCatalogResponse {
  info: {
    title: string;
    description: string;
    version: string;
    baseUrl: string;
  };
  totalEndpoints: number;
  categories: string[];
  groups: ApiCatalogGroup[];
}
