import { type Locator, type Page, expect } from '@playwright/test';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly prices: Locator;
  readonly names: Locator;
  readonly sort: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    this.title = page.locator('.title');
    this.items = page.locator('.inventory_item');
    this.prices = page.locator('.inventory_item_price');
    this.names = page.locator('.inventory_item_name');
    this.sort = page.locator('.product_sort_container');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
  }

  async open() {
    await this.page.goto('/inventory.html');
    await expect(this.title).toHaveText('Products');
  }

  /** Adiciona um produto pelo nome visível, ex.: "Sauce Labs Backpack" */
  async addToCart(productName: string) {
    const item = this.items.filter({ hasText: productName });
    await item.getByRole('button', { name: /add to cart/i }).click();
  }

  async sortBy(option: SortOption) {
    await this.sort.selectOption(option);
  }

  async priceValues(): Promise<number[]> {
    const texts = await this.prices.allTextContents();
    return texts.map((t) => Number(t.replace('$', '')));
  }

  async goToCart() {
    await this.cartLink.click();
  }
}
