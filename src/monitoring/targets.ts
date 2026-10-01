/**
 * Serviços monitorados pelo health check.
 * Para adicionar um serviço novo, basta incluir um item nesta lista.
 */
export type HealthEnv = 'api' | 'web';

export interface HealthTarget {
  id: string;
  name: string;
  env: HealthEnv;
  url: string;
}

const API_URL = process.env.API_URL ?? 'https://serverest.dev';
const SAUCE_URL = process.env.SAUCE_URL ?? 'https://www.saucedemo.com';

export const HEALTH_TARGETS: HealthTarget[] = [
  { id: 'serverest-usuarios', name: 'ServeRest · Usuários', env: 'api', url: `${API_URL}/usuarios` },
  { id: 'serverest-produtos', name: 'ServeRest · Produtos', env: 'api', url: `${API_URL}/produtos` },
  { id: 'serverest-carrinhos', name: 'ServeRest · Carrinhos', env: 'api', url: `${API_URL}/carrinhos` },
  { id: 'saucedemo-web', name: 'SauceDemo · Loja', env: 'web', url: SAUCE_URL },
];
