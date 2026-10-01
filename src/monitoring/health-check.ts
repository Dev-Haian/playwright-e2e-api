import fs from 'fs';
import path from 'path';
import { HEALTH_TARGETS, type HealthTarget } from './targets';

/**
 * Health check dos serviços usados pelos testes.
 *
 * Regra de classificação:
 *  - DOWN: HTTP 408, 500, 502, 504, timeout ou falha de rede
 *  - UP:   qualquer outra resposta HTTP (um 401 ou 404 prova que o serviço respondeu)
 *
 * Entre execuções guardamos o último estado de cada serviço para detectar
 * transições: o que acabou de cair e o que voltou. Só transições geram alerta,
 * para não mandar a mesma notificação a cada execução.
 */
export const CRITICAL_STATUS_CODES = [408, 500, 502, 504] as const;

export type HealthStatus = 'up' | 'down';

export interface ProbeResult {
  id: string;
  name: string;
  env: HealthTarget['env'];
  url: string;
  status: HealthStatus;
  statusCode: number | null;
  durationMs: number;
  slow: boolean;
  reason: string;
  checkedAt: string;
}

export interface HealthReport {
  trigger: string;
  startedAt: string;
  finishedAt: string;
  summary: { total: number; up: number; down: number; slow: number; totalDurationMs: number };
  results: ProbeResult[];
  transitions: { newlyDown: string[]; recovered: string[] };
}

export type HealthState = Record<string, HealthStatus>;

const TIMEOUT_MS = Number(process.env.HEALTH_TIMEOUT_MS ?? 8_000);
const SLOW_MS = Number(process.env.HEALTH_SLOW_MS ?? 2_000);
const OUT_DIR = path.resolve(process.cwd(), 'health-results');
const STATE_FILE = path.join(OUT_DIR, 'state.json');

export function isCritical(statusCode: number | null): boolean {
  return statusCode !== null && (CRITICAL_STATUS_CODES as readonly number[]).includes(statusCode);
}

/** Decide UP/DOWN a partir do código HTTP (função pura, coberta por testes unitários) */
export function classify(statusCode: number): { status: HealthStatus; reason: string } {
  if (isCritical(statusCode)) {
    return { status: 'down', reason: `HTTP ${statusCode}: código crítico` };
  }
  return { status: 'up', reason: `HTTP ${statusCode}: serviço respondeu` };
}

/** Compara o estado anterior com o atual e devolve o que caiu e o que voltou */
export function diffTransitions(previous: HealthState, results: Pick<ProbeResult, 'id' | 'status'>[]) {
  const newlyDown: string[] = [];
  const recovered: string[] = [];
  for (const r of results) {
    const before = previous[r.id];
    if (r.status === 'down' && before !== 'down') newlyDown.push(r.id);
    if (r.status === 'up' && before === 'down') recovered.push(r.id);
  }
  return { newlyDown, recovered };
}

export async function probe(target: HealthTarget, timeoutMs = TIMEOUT_MS): Promise<ProbeResult> {
  const base = { id: target.id, name: target.name, env: target.env, url: target.url };

  // Simulação de queda para testar alertas: FORCE_DOWN=serverest-usuarios
  if (process.env.FORCE_DOWN === target.id) {
    return { ...base, status: 'down', statusCode: 500, durationMs: 0, slow: false, reason: 'HTTP 500: queda simulada (FORCE_DOWN)', checkedAt: new Date().toISOString() };
  }

  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(target.url, { redirect: 'follow', signal: controller.signal });
    const durationMs = Date.now() - started;
    return { ...base, ...classify(response.status), statusCode: response.status, durationMs, slow: durationMs > SLOW_MS, checkedAt: new Date().toISOString() };
  } catch (error) {
    const durationMs = Date.now() - started;
    const timedOut = error instanceof Error && error.name === 'AbortError';
    return {
      ...base,
      status: 'down',
      statusCode: null,
      durationMs,
      slow: false,
      reason: timedOut ? `Timeout após ${timeoutMs} ms` : `Falha de rede: ${(error as Error).message}`,
      checkedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timer);
  }
}

function loadState(): HealthState {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) as HealthState;
  } catch {
    return {};
  }
}

export async function runHealthCheck(targets: HealthTarget[] = HEALTH_TARGETS): Promise<HealthReport> {
  const startedAt = new Date().toISOString();
  const wallStart = Date.now();
  const previous = loadState();

  const results = await Promise.all(targets.map((t) => probe(t)));
  results.sort((a, b) => a.env.localeCompare(b.env) || a.name.localeCompare(b.name));

  const report: HealthReport = {
    trigger: process.env.GITHUB_EVENT_NAME ?? 'manual',
    startedAt,
    finishedAt: new Date().toISOString(),
    summary: {
      total: results.length,
      up: results.filter((r) => r.status === 'up').length,
      down: results.filter((r) => r.status === 'down').length,
      slow: results.filter((r) => r.slow).length,
      totalDurationMs: Date.now() - wallStart,
    },
    results,
    transitions: diffTransitions(previous, results),
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'health.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(STATE_FILE, JSON.stringify(Object.fromEntries(results.map((r) => [r.id, r.status])), null, 2));

  return report;
}

export { OUT_DIR };
