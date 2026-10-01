import { test, expect } from '../../src/fixtures';
import { buildProduct, buildUser } from '../../src/data/factories';

test.describe('API /produtos (autorização)', () => {
  test('admin autenticado cadastra produto @smoke', async ({ api, adminUser }) => {
    const token = await api.token(adminUser.email, adminUser.password);

    const response = await api.createProduct(buildProduct(), token);

    expect(response.status()).toBe(201);
    const { _id } = await response.json();
    expect(_id).toBeTruthy();

    await api.deleteProduct(_id, token);
  });

  test('sem token devolve 401', async ({ api }) => {
    const response = await api.createProduct(buildProduct());

    expect(response.status()).toBe(401);
  });

  test('usuário comum (não admin) devolve 403', async ({ api }) => {
    const comum = buildUser({ administrador: 'false' });
    const { _id } = await (await api.createUser(comum)).json();

    try {
      const token = await api.token(comum.email, comum.password);
      const response = await api.createProduct(buildProduct(), token);

      expect(response.status()).toBe(403);
      expect((await response.json()).message).toBe('Rota exclusiva para administradores');
    } finally {
      await api.deleteUser(_id);
    }
  });
});
