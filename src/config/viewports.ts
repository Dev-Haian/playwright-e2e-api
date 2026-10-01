/**
 * Matriz de resoluções usada nos testes E2E.
 * Cada viewport vira um projeto do Playwright (e2e-fullhd, e2e-mobile...).
 *
 * Para rodar só uma: TEST_VIEWPORT=mobile npx playwright test
 * Para várias:       TEST_VIEWPORT=fullhd,mobile npx playwright test
 */
export interface TestViewport {
  id: string;
  label: string;
  width: number;
  height: number;
  isMobile?: boolean;
  hasTouch?: boolean;
  deviceScaleFactor?: number;
}

export const TEST_VIEWPORTS: TestViewport[] = [
  { id: 'fullhd', label: '1920×1080', width: 1920, height: 1080 },
  { id: 'notebook', label: '1366×768', width: 1366, height: 768 },
  { id: 'tablet', label: '768×1024', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { id: 'mobile', label: '390×844', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
];

export function getActiveViewports(filter?: string): TestViewport[] {
  if (!filter || filter === 'all') return TEST_VIEWPORTS;

  const wanted = filter.toLowerCase().split(',').map((v) => v.trim());
  const matched = TEST_VIEWPORTS.filter(
    (v) => wanted.includes(v.id) || wanted.includes(`${v.width}x${v.height}`),
  );

  if (matched.length === 0) {
    throw new Error(`TEST_VIEWPORT="${filter}" inválido. Use: ${TEST_VIEWPORTS.map((v) => v.id).join(', ')}`);
  }
  return matched;
}
