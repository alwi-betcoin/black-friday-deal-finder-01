// Rendering helpers: one card per deal, plus the cross-store comparison strip.
import { VERDICTS } from './data.js';

export function money(n) {
  // Whole-dollar prices render without cents ($149), others with two ($149.99).
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
}
export function pctOff(deal) {
  return Math.round((1 - deal.sale / deal.usual) * 100);
}
export function dealScore(deal) {
  const base = pctOff(deal);
  const bonus = { 'true-low': 18, strong: 10, routine: 0, inflated: -8 }[deal.verdict] || 0;
  return Math.max(1, Math.min(99, base + bonus));
}
export function cardHtml(deal) {
  const v = VERDICTS[deal.verdict];
  return `<article class="card">
    <div class="meta">${deal.store} · ${deal.cat}</div>
    <h3>${deal.name}</h3>
    <div class="price"><span class="sale">${money(deal.sale)}</span><span class="was">${money(deal.usual)}</span><span class="off">-${pctOff(deal)}%</span></div>
    <span class="badge v-${deal.verdict}">${v.label} — ${v.hint}</span>
    <p class="note">${deal.note}</p>
    <div class="score">Deal score ${dealScore(deal)}/100 · You save ${money(deal.usual - deal.sale)}</div>
    <p class="src">Checked ${deal.checked}<br>Source: ${deal.source}</p>
    <a class="btn" href="${deal.url}" target="_blank" rel="noopener">View deal at ${deal.store} →</a>
  </article>`;
}
export function compareHtml(deals) {
  const groups = {};
  for (const d of deals) if (d.group) (groups[d.group] ||= []).push(d);
  const blocks = Object.values(groups).filter((g) => g.length > 1).map((g) => {
    const sorted = [...g].sort((a, b) => a.sale - b.sale);
    const best = sorted[0];
    const lines = sorted.map((d) => `${d.store}: ${money(d.sale)}`).join(' · ');
    return `<div class="cmp"><b>Same product, compared:</b> ${best.name}<br>${lines}<br>Best price: <b>${best.store} at ${money(best.sale)}</b> (-${pctOff(best)}% vs ${money(best.usual)})</div>`;
  });
  return blocks.length ? `<h2>Head-to-head: same product, different stores</h2>` + blocks.join('') : '';
}
