import type { HealthReport } from './health-check';

/**
 * Envia alerta só quando há transição (caiu / voltou).
 * Funciona com webhooks que aceitam JSON { text } (Slack, Discord via /slack, Teams workflows).
 * Sem HEALTH_WEBHOOK_URL definido, nada é enviado.
 */
export async function notifyTransitions(report: HealthReport): Promise<boolean> {
  const url = process.env.HEALTH_WEBHOOK_URL;
  const { newlyDown, recovered } = report.transitions;
  if (!url || (newlyDown.length === 0 && recovered.length === 0)) return false;

  const byId = new Map(report.results.map((r) => [r.id, r]));
  const lines: string[] = [];
  for (const id of newlyDown) {
    const r = byId.get(id)!;
    lines.push(`🔴 CAIU: ${r.name} (${r.reason})`);
  }
  for (const id of recovered) {
    const r = byId.get(id)!;
    lines.push(`🟢 VOLTOU: ${r.name} (${r.durationMs} ms)`);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: `Health check · ${report.summary.up}/${report.summary.total} UP\n${lines.join('\n')}` }),
  });
  return response.ok;
}
