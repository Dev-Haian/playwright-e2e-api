import { type APIRequestContext, type APIResponse } from '@playwright/test';

export type User = {
  nome: string;
  email: string;
  password: string;
  administrador: 'true' | 'false';
};

export type Product = {
  nome: string;
  preco: number;
  descricao: string;
  quantidade: number;
};

/**
 * Cliente fino para a API pública ServeRest (https://serverest.dev).
 * Cada método devolve a APIResponse crua: quem decide o que validar é o teste.
 */
export class ServeRestClient {
  constructor(private readonly request: APIRequestContext) {}

  createUser(user: User): Promise<APIResponse> {
    return this.request.post('/usuarios', { data: user });
  }

  getUser(id: string): Promise<APIResponse> {
    return this.request.get(`/usuarios/${id}`);
  }

  deleteUser(id: string): Promise<APIResponse> {
    return this.request.delete(`/usuarios/${id}`);
  }

  login(email: string, password: string): Promise<APIResponse> {
    return this.request.post('/login', { data: { email, password } });
  }

  /** Faz login e devolve o token pronto para o header Authorization */
  async token(email: string, password: string): Promise<string> {
    const response = await this.login(email, password);
    const body = await response.json();
    return body.authorization as string;
  }

  createProduct(product: Product, token?: string): Promise<APIResponse> {
    return this.request.post('/produtos', {
      data: product,
      headers: token ? { Authorization: token } : {},
    });
  }

  deleteProduct(id: string, token: string): Promise<APIResponse> {
    return this.request.delete(`/produtos/${id}`, { headers: { Authorization: token } });
  }
}
