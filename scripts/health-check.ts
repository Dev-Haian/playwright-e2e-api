import fs from 'fs';
import path from 'path';
import { OUT_DIR, runHealthCheck } from '../src/monitoring/health-check';
import { notifyTransitions } from '../src/monitoring/notifier';
import { toHtml, toMarkdown } from '../src/monitoring/report';

/**
 * Uso: npm run health
 * Gera health-results/health.json e health-results/index.html.
 * No GitHub Actions também escreve o resumo da execução.
 * Sai com código 1 se algum serviço estiver DOWN (STRICT_HEALTH=true).
 */
async function main() {
  const report = await runHealthCheck();

  for (const r of report.results) {
    const mark = r.status === 'up' ? '✓' : '✗';
    console.log(`${mark} [${r.env.toUpperCase()}] ${r.name.padEnd(24)} ${String(r.statusCode ?? 'ERR').padEnd(4)} ${r.durationMs} ms  ${r.reason}`);
  }
  console.log(`\n${report.summary.up}/${report.summary.total} UP · ${report.summary.totalDurationMs} ms`);
  if (report.transitions.newlyDown.length) console.log(`Caíram agora: ${report.transitions.newlyDown.join(', ')}`);
  if (report.transitions.recovered.length) console.log(`Voltaram: ${report.transitions.recovered.join(', ')}`);

  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), toHtml(report));
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, toMarkdown(report) + '\n');

  if (await notifyTransitions(report)) console.log('Alerta enviado para o webhook.');

  if (process.env.STRICT_HEALTH === 'true' && report.summary.down > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
