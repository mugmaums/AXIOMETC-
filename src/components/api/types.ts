export interface AxiometicApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string; // e.g. "axio_live_" or "axio_test_"
  environment: 'live' | 'test';
  scopes: string[]; // ["full_access"]
  createdAt: string;
  lastUsedAt?: string;
  status: 'active' | 'revoked';
  authorAxiometicId: string;
}

export interface ApiEndpointSpec {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  title: string;
  description: string;
  sampleBody?: Record<string, any>;
}
