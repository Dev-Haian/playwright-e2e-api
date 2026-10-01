import { test, expect } from '../../src/fixtures';

test.describe('Ordenação da vitrine', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
  });

  test('preço do menor para o maior', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');

    const prices = await inventoryPage.priceValues();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('preço do maior para o menor', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');

    const prices = await inventoryPage.priceValues();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('nome de Z para A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');

    const names = await inventoryPage.names.allTextContents();
    expect(names).toEqual([...names].sort().reverse());
  });
});
