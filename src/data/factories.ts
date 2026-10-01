import { faker } from '@faker-js/faker/locale/pt_BR';
import type { Product, User } from '../api/ServeRestClient';
import type { Buyer } from '../pages/CheckoutPage';

/**
 * Fábricas de massa de dados.
 * Cada chamada gera dados únicos, então os testes podem rodar em paralelo
 * sem um interferir no outro.
 */
export function buildUser(overrides: Partial<User> = {}): User {
  const unique = `${Date.now()}${faker.string.numeric(4)}`;
  return {
    nome: faker.person.fullName(),
    email: `qa.${unique}@teste.dev`,
    password: faker.internet.password({ length: 12 }),
    administrador: 'true',
    ...overrides,
  };
}

export function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    nome: `Produto QA ${Date.now()} ${faker.string.alphanumeric(5)}`,
    preco: faker.number.int({ min: 10, max: 999 }),
    descricao: faker.commerce.productDescription().slice(0, 80),
    quantidade: faker.number.int({ min: 1, max: 100 }),
    ...overrides,
  };
}

export function buildBuyer(): Buyer {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode('#####-###'),
  };
}

/** Usuários de demonstração públicos do SauceDemo (exibidos na própria tela de login) */
export const sauceUsers = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  locked: { username: 'locked_out_user', password: 'secret_sauce' },
} as const;
