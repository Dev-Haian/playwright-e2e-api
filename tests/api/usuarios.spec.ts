import { test, expect } from '../../src/fixtures';
import { buildUser } from '../../src/data/factories';

test.describe('API /usuarios', () => {
  test('cadastra usuário e consulta pelo id @smoke', async ({ api }) => {
    const user = buildUser();

    const created = await api.createUser(user);
    expect(created.status()).toBe(201);
    const { _id, message } = await created.json();
    expect(message).toBe('Cadastro realizado com sucesso');

    const found = await api.getUser(_id);
    expect(found.status()).toBe(200);
    expect(await found.json()).toMatchObject({ nome: user.nome, email: user.email, _id });

    await api.deleteUser(_id);
  });

  test('não permite e-mail duplicado', async ({ api, adminUser }) => {
    const duplicate = await api.createUser(buildUser({ email: adminUser.email }));

    expect(duplicate.status()).toBe(400);
    expect((await duplicate.json()).message).toBe('Este email já está sendo usado');
  });

  test('exclui usuário e ele deixa de existir', async ({ api }) => {
    const created = await api.createUser(buildUser());
    const { _id } = await created.json();

    const deleted = await api.deleteUser(_id);
    expect(deleted.status()).toBe(200);

    const found = await api.getUser(_id);
    expect(found.status()).toBe(400);
  });

  test('rejeita cadastro sem campos obrigatórios', async ({ request }) => {
    const response = await request.post('/usuarios', { data: {} });

    expect(response.status()).toBe(400);
    const body = await response.json();
    // A API devolve uma mensagem por campo faltando
    expect(Object.keys(body)).toEqual(expect.arrayContaining(['nome', 'email', 'password', 'administrador']));
  });
});
