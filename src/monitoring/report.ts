import type { HealthReport } from './health-check';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Tabela em Markdown para o resumo da execução no GitHub Actions */
export function toMarkdown(report: HealthReport): string {
  const rows = report.results
    .map((r) => `| ${r.status === 'up' ? '🟢 UP' : '🔴 DOWN'} | ${r.name} | ${r.statusCode ?? '—'} | ${r.durationMs} ms${r.slow ? ' 🐢' : ''} | ${r.reason} |`)
    .join('\n');
  return [
    `### Health check · ${report.summary.up}/${report.summary.total} serviços UP`,
    '',
    '| Status | Serviço | HTTP | Tempo | Motivo |',
    '| --- | --- | --- | --- | --- |',
    rows,
    '',
    `Critério: DOWN = HTTP 408, 500, 502, 504, timeout ou falha de rede. 🐢 = acima do limite de lentidão.`,
  ].join('\n');
}

/** Página HTML autocontida, publicada junto com o relatório do Playwright */
export function toHtml(report: HealthReport): string {
  const allUp = report.summary.down === 0;
  const cards = report.results
    .map(
      (r) => `
      <article class="card ${r.status}">
        <header><span class="dot"></span><strong>${esc(r.name)}</strong><span class="env">${r.env.toUpperCase()}</span></header>
        <dl>
          <div><dt>HTTP</dt><dd>${r.statusCode ?? '—'}</dd></div>
          <div><dt>Tempo</dt><dd>${r.durationMs} ms${r.slow ? ' · lento' : ''}</dd></div>
        </dl>
        <p>${esc(r.reason)}</p>
        <code>${esc(r.url)}</code>
      </article>`,
    )
    .join('');

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Health check</title>
<style>
  :root{--bg:#f6f7f9;--fg:#1b1f24;--muted:#5b6470;--card:#fff;--line:#e3e6ea;--up:#1f9d55;--down:#d64545}
  @media (prefers-color-scheme:dark){:root{--bg:#0f1216;--fg:#e8eaed;--muted:#9aa3ad;--card:#181c22;--line:#2a3038}}
  *{box-sizing:border-box}body{margin:0;font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--fg)}
  main{max-width:960px;margin:0 auto;padding:32px 16px}
  h1{margin:0 0 4px;font-size:24px}.sub{color:var(--muted);margin:0 0 24px}
  .banner{padding:14px 18px;border-radius:10px;font-weight:600;margin-bottom:24px;color:#fff;background:${allUp ? 'var(--up)' : 'var(--down)'}}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
  .card{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--up);border-radius:10px;padding:14px 16px}
  .card.down{border-left-color:var(--down)}
  .card header{display:flex;align-items:center;gap:8px}.env{margin-left:auto;font-size:11px;color:var(--muted);border:1px solid var(--line);border-radius:4px;padding:1px 6px}
  .dot{width:10px;height:10px;border-radius:50%;background:var(--up)}.down .dot{background:var(--down)}
  dl{display:flex;gap:24px;margin:10px 0 6px}dt{font-size:12px;color:var(--muted)}dd{margin:0;font-weight:600}
  p{margin:0 0 6px;color:var(--muted);font-size:13px}code{font-size:12px;color:var(--muted);word-break:break-all}
  footer{margin-top:28px;color:var(--muted);font-size:13px}a{color:inherit}
</style></head>
<body><main>
  <h1>Health check dos serviços</h1>
  <p class="sub">Última verificação: ${new Date(report.finishedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} (Brasília) · ${report.summary.totalDurationMs} ms</p>
  <div class="banner">${allUp ? 'Todos os serviços estão no ar' : `${report.summary.down} serviço(s) fora do ar`} · ${report.summary.up}/${report.summary.total} UP</div>
  <section class="grid">${cards}</section>
  <footer>Critério: DOWN = HTTP 408, 500, 502, 504, timeout ou falha de rede. Outras respostas mostram que o serviço está respondendo.<br>
  <a href="../">← Relatório dos testes</a></footer>
</main></body></html>`;
}
