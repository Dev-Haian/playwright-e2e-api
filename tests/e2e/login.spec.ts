import { test, expect } from '../../src/fixtures';
import { sauceUsers } from '../../src/data/factories';

// Estes testes precisam começar deslogados, então ignoram a sessão salva.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('usuário válido acessa a vitrine de produtos @smoke', async ({ loginPage, inventoryPage, page }) => {
    await loginPage.login(sauceUsers.standard.username, sauceUsers.standard.password);

    await expect(page).toHaveURL(/inventory/);
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('usuário bloqueado vê mensagem de bloqueio', async ({ loginPage }) => {
    await loginPage.login(sauceUsers.locked.username, sauceUsers.locked.password);

    await loginPage.expectError('this user has been locked out');
  });

  test('senha incorreta não autentica', async ({ loginPage, page }) => {
    await loginPage.login(sauceUsers.standard.username, 'senha_errada');

    await loginPage.expectError('Username and password do not match');
    await expect(page).not.toHaveURL(/inventory/);
  });

  // Mesmo teste, vários dados: técnica de partição de equivalência nos campos obrigatórios
  const camposObrigatorios = [
    { caso: 'sem usuário', user: '', pass: 'secret_sauce', erro: 'Username is required' },
    { caso: 'sem senha', user: 'standard_user', pass: '', erro: 'Password is required' },
  ];

  for (const { caso, user, pass, erro } of camposObrigatorios) {
    test(`campo obrigatório: ${caso}`, async ({ loginPage }) => {
      await loginPage.login(user, pass);
      await loginPage.expectError(erro);
    });
  }

  test('rota interna sem login redireciona para o login', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await loginPage.expectError("You can only access '/inventory.html' when you are logged in");
  });
});
