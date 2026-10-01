import { test, expect } from '@playwright/test';
import { classify, diffTransitions, isCritical } from '../../src/monitoring/health-check';

/**
 * Testes unitários da regra do health check.
 * Rodam sem rede e sem navegador: validam só a lógica de classificação.
 */
test.describe('Health check: regra de classificação', () => {
  for (const code of [408, 500, 502, 504]) {
    test(`HTTP ${code} é DOWN`, () => {
      expect(isCritical(code)).toBe(true);
      expect(classify(code).status).toBe('down');
    });
  }

  for (const code of [200, 201, 301, 401, 404, 503]) {
    test(`HTTP ${code} é UP (o serviço respondeu)`, () => {
      expect(classify(code).status).toBe('up');
    });
  }

  test('sem código HTTP não é crítico por si só', () => {
    expect(isCritical(null)).toBe(false);
  });
});

test.describe('Health check: transições entre execuções', () => {
  test('detecta serviço que acabou de cair', () => {
    const t = diffTransitions({ a: 'up' }, [{ id: 'a', status: 'down' }]);
    expect(t).toEqual({ newlyDown: ['a'], recovered: [] });
  });

  test('detecta serviço que voltou', () => {
    const t = diffTransitions({ a: 'down' }, [{ id: 'a', status: 'up' }]);
    expect(t).toEqual({ newlyDown: [], recovered: ['a'] });
  });

  test('não repete alerta se continua fora', () => {
    const t = diffTransitions({ a: 'down' }, [{ id: 'a', status: 'down' }]);
    expect(t).toEqual({ newlyDown: [], recovered: [] });
  });

  test('primeira execução já fora conta como queda', () => {
    const t = diffTransitions({}, [{ id: 'novo', status: 'down' }]);
    expect(t.newlyDown).toEqual(['novo']);
  });
});
