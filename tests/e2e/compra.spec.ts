import { test, expect } from '../../src/fixtures';
import { buildBuyer } from '../../src/data/factories';

const MOCHILA = 'Sauce Labs Backpack';
const LANTERNA = 'Sauce Labs Bike Light';

test.describe('Jornada de compra', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open(); // já logado via storageState
  });

  test('compra completa de dois produtos @smoke', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await test.step('adicionar produtos ao carrinho', async () => {
      await inventoryPage.addToCart(MOCHILA);
      await inventoryPage.addToCart(LANTERNA);
      await expect(inventoryPage.cartBadge).toHaveText('2');
    });

    await test.step('revisar carrinho', async () => {
      await inventoryPage.goToCart();
      await expect(cartPage.items).toHaveCount(2);
      await cartPage.checkout();
    });

    await test.step('preencher dados do comprador', async () => {
      await checkoutPage.fillBuyer(buildBuyer());
    });

    await test.step('validar cálculo do subtotal', async () => {
      // Regra de negócio: o subtotal exibido deve ser a soma dos itens
      expect(await checkoutPage.displayedItemTotal()).toBe(await checkoutPage.sumOfItemPrices());
    });

    await test.step('finalizar pedido', async () => {
      await checkoutPage.finish();
      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    });
  });

  test('remover item do carrinho atualiza o contador', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(MOCHILA);
    await inventoryPage.addToCart(LANTERNA);
    await inventoryPage.goToCart();

    await cartPage.remove(MOCHILA);

    await expect(cartPage.items).toHaveCount(1);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('checkout exige os dados do comprador', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addToCart(MOCHILA);
    await inventoryPage.goToCart();
    await cartPage.checkout();

    await checkoutPage.continueButton.click();

    await expect(checkoutPage.error).toContainText('First Name is required');
  });
});
