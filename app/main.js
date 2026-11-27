// DealHunt Friday app wiring: search, category/store/discount filters and
// sorting over the local deal data. No network requests are made.
import { DEALS } from './data.js';
import { cardHtml, compareHtml, dealScore, pctOff } from './views.js';

const $ = (id) => document.getElementById(id);
const grid = $('grid'), count = $('count'), compare = $('compare');

function fillSelect(el, values) {
  el.innerHTML = '<option value="">All</option>' + values.map((v) => `<option>${v}</option>`).join('');
}
fillSelect($('cat'), [...new Set(DEALS.map((d) => d.cat))].sort());
fillSelect($('store'), [...new Set(DEALS.map((d) => d.store))].sort());

$('stats').innerHTML = [
  [DEALS.length, 'deals checked'],
  [new Set(DEALS.map((d) => d.store)).size, 'stores'],
  [Math.max(...DEALS.map(pctOff)) + '%', 'biggest cut'],
  [DEALS.filter((d) => d.verdict === 'true-low').length, 'true lows'],
].map(([n, l]) => `<div class="stat"><b>${n}</b>${l}</div>`).join('');

function currentDeals() {
  const q = $('q').value.trim().toLowerCase();
  const cat = $('cat').value, store = $('store').value, disc = Number($('disc').value);
  let list = DEALS.filter((d) =>
    (!q || (d.name + ' ' + d.store + ' ' + d.cat).toLowerCase().includes(q)) &&
    (!cat || d.cat === cat) && (!store || d.store === store) && pctOff(d) >= disc);
  const sort = $('sort').value;
  if (sort === 'score') list.sort((a, b) => dealScore(b) - dealScore(a));
  if (sort === 'off') list.sort((a, b) => pctOff(b) - pctOff(a));
  if (sort === 'save') list.sort((a, b) => (b.usual - b.sale) - (a.usual - a.sale));
  if (sort === 'low') list.sort((a, b) => a.sale - b.sale);
  return list;
}
function render() {
  const list = currentDeals();
  const filtered = $('q').value || $('cat').value || $('store').value || Number($('disc').value) > 0;
  const sortLabel = $('sort').selectedOptions[0].textContent.toLowerCase();
  count.textContent = `Showing ${list.length} of ${DEALS.length} deals — sorted by ${sortLabel}` + (filtered ? ' — filters active' : '');
  compare.innerHTML = filtered ? '' : compareHtml(DEALS);
  grid.innerHTML = list.length ? list.map(cardHtml).join('') : '<p>No deals match — try clearing a filter.</p>';
}
// Support pre-set views for sharing, e.g. #cat=Audio&disc=40
function applyHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  if (p.get('q')) $('q').value = p.get('q');
  if (p.get('cat')) $('cat').value = p.get('cat');
  if (p.get('store')) $('store').value = p.get('store');
  if (p.get('disc')) $('disc').value = p.get('disc');
  if (p.get('sort')) $('sort').value = p.get('sort');
}
for (const id of ['q', 'cat', 'store', 'disc', 'sort']) $(id).addEventListener('input', render);
applyHash();
render();
