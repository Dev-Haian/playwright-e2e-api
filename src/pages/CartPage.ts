import { type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly items: Locator;
  readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    this.items = page.locator('.cart_item');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async remove(productName: string) {
    await this.items.filter({ hasText: productName }).getByRole('button', { name: /remove/i }).click();
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
