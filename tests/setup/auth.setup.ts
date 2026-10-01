import { test as setup, expect } from '@playwright/test';
import { sauceUsers } from '../../src/data/factories';
import { LoginPage } from '../../src/pages/LoginPage';

const AUTH_FILE = '.auth/standard_user.json';

/**
 * Faz login uma única vez e salva a sessão.
 * Os testes E2E reaproveitam esse arquivo e começam já logados,
 * o que deixa a suíte mais rápida e menos sujeita a falhas no login.
 */
setup('autenticar standard_user', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.login(sauceUsers.standard.username, sauceUsers.standard.password);
  await expect(page).toHaveURL(/inventory/);
  await page.context().storageState({ path: AUTH_FILE });
});
