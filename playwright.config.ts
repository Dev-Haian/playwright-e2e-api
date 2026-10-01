import { defineConfig, devices } from '@playwright/test';
import { getActiveViewports, type TestViewport } from './src/config/viewports';

/**
 * Projetos:
 *  - setup:          faz login uma única vez e salva a sessão (storageState)
 *  - e2e-<viewport>: um projeto por resolução (fullhd, notebook, tablet, mobile)
 *  - api:            testes de API, sem navegador
 *  - unit:           testes da lógica do health check, sem rede
 */
const SAUCE_URL = process.env.SAUCE_URL ?? 'https://www.saucedemo.com';
const API_URL = process.env.API_URL ?? 'https://serverest.dev';
const AUTH_FILE = '.auth/standard_user.json';

function viewportUse(v: TestViewport) {
  return {
    ...devices['Desktop Chrome'],
    viewport: { width: v.width, height: v.height },
    isMobile: v.isMobile ?? false,
    hasTouch: v.hasTouch ?? false,
    ...(v.deviceScaleFactor ? { deviceScaleFactor: v.deviceScaleFactor } : {}),
  };
}

const e2eProjects = getActiveViewports(process.env.TEST_VIEWPORT).map((v) => ({
  name: `e2e-${v.id}`,
  testDir: './tests/e2e',
  dependencies: ['setup'],
  use: { ...viewportUse(v), baseURL: SAUCE_URL, storageState: AUTH_FILE },
}));

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
      use: { ...devices['Desktop Chrome'], baseURL: SAUCE_URL },
    },
    ...e2eProjects,
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: API_URL, extraHTTPHeaders: { Accept: 'application/json' } },
    },
    {
      name: 'unit',
      testDir: './tests/unit',
    },
  ],
});
