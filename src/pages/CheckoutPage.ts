import { type Locator, type Page } from '@playwright/test';

export type Buyer = { firstName: string; lastName: string; postalCode: string };

export class CheckoutPage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly error: Locator;
  readonly itemTotal: Locator;
  readonly itemPrices: Locator;
  readonly completeHeader: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.finishButton = page.getByTestId('finish');
    this.error = page.getByTestId('error');
    this.itemTotal = page.locator('.summary_subtotal_label');
    this.itemPrices = page.locator('.cart_item .inventory_item_price');
    this.completeHeader = page.locator('.complete-header');
  }

  async fillBuyer(buyer: Buyer) {
    await this.firstName.fill(buyer.firstName);
    await this.lastName.fill(buyer.lastName);
    await this.postalCode.fill(buyer.postalCode);
    await this.continueButton.click();
  }

  /** Lê o subtotal exibido na tela ("Item total: $39.98" → 39.98) */
  async displayedItemTotal(): Promise<number> {
    const text = (await this.itemTotal.textContent()) ?? '';
    return Number(text.replace(/[^0-9.]/g, ''));
  }

  /** Soma os preços dos itens listados no resumo */
  async sumOfItemPrices(): Promise<number> {
    const texts = await this.itemPrices.allTextContents();
    const total = texts.reduce((acc, t) => acc + Number(t.replace('$', '')), 0);
    return Math.round(total * 100) / 100;
  }

  async finish() {
    await this.finishButton.click();
  }
}
