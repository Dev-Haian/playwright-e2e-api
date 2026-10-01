import { test as base } from '@playwright/test';
import { ServeRestClient, type User } from '../api/ServeRestClient';
import { buildUser } from '../data/factories';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';

type CreatedUser = User & { _id: string };

type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  api: ServeRestClient;
  /** Cria um usuário admin antes do teste e apaga depois, mesmo se o teste falhar */
  adminUser: CreatedUser;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),

  api: async ({ request }, use) => use(new ServeRestClient(request)),

  adminUser: async ({ api }, use) => {
    const user = buildUser({ administrador: 'true' });
    const response = await api.createUser(user);
    const { _id } = await response.json();

    await use({ ...user, _id });

    await api.deleteUser(_id); // limpeza: não deixa lixo na API pública
  },
});

export { expect } from '@playwright/test';
