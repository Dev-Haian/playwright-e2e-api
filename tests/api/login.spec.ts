import { test, expect } from '../../src/fixtures';

test.describe('API /login', () => {
  test('credenciais válidas devolvem token Bearer @smoke', async ({ api, adminUser }) => {
    const response = await api.login(adminUser.email, adminUser.password);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toBe('Login realizado com sucesso');
    expect(body.authorization).toMatch(/^Bearer\s.+/);
  });

  test('senha errada devolve 401', async ({ api, adminUser }) => {
    const response = await api.login(adminUser.email, 'senha-errada');

    expect(response.status()).toBe(401);
    expect((await response.json()).message).toBe('Email e/ou senha inválidos');
  });

  test('responde em menos de 3 segundos', async ({ api, adminUser }) => {
    const start = Date.now();
    await api.login(adminUser.email, adminUser.password);

    // Limite folgado de propósito: a API é pública e compartilhada
    expect(Date.now() - start).toBeLessThan(3_000);
  });
});
