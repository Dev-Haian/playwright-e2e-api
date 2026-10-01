import { defineConfig, devices } from '@playwright/test';

/**
 * Três camadas de projetos:
 *  - setup:       faz login uma única vez e salva a sessão (storageState)
 *  - e2e-*:       reaproveitam a sessão salva, em desktop e mobile
 *  - api:         testes de API, sem navegador
 */
const SAUCE_URL = process.env.SAUCE_URL ?? 'https://www.saucedemo.com';
const API_URL = process.env.API_URL ?? 'https://serverest.dev';
const AUTH_FILE = '.auth/standard_user.json';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: { baseURL: SAUCE_URL },
    },
    {
      name: 'e2e-desktop',
      testDir: './tests/e2e',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], baseURL: SAUCE_URL, storageState: AUTH_FILE },
    },
    {
      name: 'e2e-mobile',
      testDir: './tests/e2e',
      dependencies: ['setup'],
      use: { ...devices['Pixel 7'], baseURL: SAUCE_URL, storageState: AUTH_FILE },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: API_URL, extraHTTPHeaders: { Accept: 'application/json' } },
    },
  ],
});
