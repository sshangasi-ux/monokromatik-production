#!/usr/bin/env node
// Read GA4 (Data API) + Search Console using GA_REFRESH_TOKEN in video/.env.
// Pure Node https. Auto-discovers the GA4 property + verified GSC site.
//   set -a; . ./.env; set +a; node build/ga-report.mjs
import https from 'node:https';
const { YT_CLIENT_ID: CID, YT_CLIENT_SECRET: SEC, GA_REFRESH_TOKEN: RT } = process.env;
if (!CID || !SEC || !RT) { console.error('Missing YT_CLIENT_ID/SECRET or GA_REFRESH_TOKEN'); process.exit(1); }

function req(method, url, headers, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(url, { method, headers }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject); if (body) r.write(body); r.end();
  });
}
async function token() {
  const b = new URLSearchParams({ client_id: CID, client_secret: SEC, refresh_token: RT, grant_type: 'refresh_token' }).toString();
  const r = await req('POST', 'https://oauth2.googleapis.com/token', { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(b) }, b);
  const j = JSON.parse(r.body); if (!j.access_token) throw new Error('token: ' + r.body); return j.access_token;
}
function ymd(d) { return d.toISOString().slice(0, 10); }

(async () => {
  const at = await token();
  const H = { Authorization: 'Bearer ' + at };
  const HJ = { ...H, 'Content-Type': 'application/json' };

  // ---- discover GA4 property (or use provided id) ----
  let pid = process.argv[2] || process.env.GA_PROPERTY_ID || null;
  const acc = pid ? { status: 0, body: '' } : await req('GET', 'https://analyticsadmin.googleapis.com/v1beta/accountSummaries', H);
  if (pid) {
    console.log('GA4 property (provided):', pid);
  } else if (acc.status === 200) {
    const j = JSON.parse(acc.body);
    const props = (j.accountSummaries || []).flatMap(a => (a.propertySummaries || []).map(p => ({ id: p.property, name: p.displayName })));
    console.log('GA4 properties:', props.map(p => `${p.name} (${p.id})`).join(' | ') || '(none)');
    const pick = props.find(p => /mono|kromatik/i.test(p.name)) || props[0];
    if (pick) pid = pick.id.replace('properties/', '');
  } else {
    console.log('! Admin API (property discovery) unavailable:', acc.status, acc.body.slice(0, 160));
  }

  if (pid) {
    const P = `https://analyticsdata.googleapis.com/v1beta/properties/${pid}:runReport`;
    const rr = async (dims, mets, limit = 12, orderMetric = mets[0]) => {
      const body = JSON.stringify({ dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
        dimensions: dims.map(name => ({ name })), metrics: mets.map(name => ({ name })),
        orderBys: [{ metric: { metricName: orderMetric }, desc: true }], limit });
      const r = await req('POST', P, HJ, body);
      if (r.status !== 200) { console.log('  ! runReport', r.status, r.body.slice(0, 160)); return null; }
      return JSON.parse(r.body);
    };
    console.log(`\n=== GA4 property ${pid} — last 28 days ===`);
    const ov = await rr([], ['totalUsers', 'sessions', 'screenPageViews'], 1);
    if (ov?.rows?.[0]) console.log('OVERVIEW: users=%s sessions=%s pageviews=%s',
      ov.rows[0].metricValues[0].value, ov.rows[0].metricValues[1].value, ov.rows[0].metricValues[2].value);
    const pages = await rr(['pagePath'], ['screenPageViews', 'totalUsers'], 15);
    if (pages?.rows) { console.log('\nTOP PAGES:'); pages.rows.forEach(r => console.log('  %s  %s views', r.metricValues[0].value.padStart(5), r.dimensionValues[0].value)); }
    const src = await rr(['sessionSourceMedium'], ['sessions', 'totalUsers'], 12);
    if (src?.rows) { console.log('\nTOP SOURCES (source/medium):'); src.rows.forEach(r => console.log('  %s  %s', r.metricValues[0].value.padStart(5), r.dimensionValues[0].value)); }
    const camp = await rr(['sessionCampaignName'], ['sessions'], 12);
    if (camp?.rows) { console.log('\nCAMPAIGNS (UTM):'); camp.rows.forEach(r => console.log('  %s  %s', r.metricValues[0].value.padStart(5), r.dimensionValues[0].value)); }
    const ctry = await rr(['country'], ['totalUsers'], 8);
    if (ctry?.rows) { console.log('\nTOP COUNTRIES:'); ctry.rows.forEach(r => console.log('  %s  %s', r.metricValues[0].value.padStart(5), r.dimensionValues[0].value)); }
  } else {
    console.log('\n(No GA4 property id — enable the "Google Analytics Admin API" too, or give me the numeric Property ID from GA4 → Admin → Property details.)');
  }

  // ---- Search Console ----
  console.log('\n=== Search Console ===');
  const sites = await req('GET', 'https://www.googleapis.com/webmasters/v3/sites', H);
  if (sites.status !== 200) { console.log('! sites.list', sites.status, sites.body.slice(0, 160)); }
  else {
    const list = (JSON.parse(sites.body).siteEntry || []).map(s => s.siteUrl);
    console.log('verified sites:', list.join(' | ') || '(none)');
    const site = list.find(s => /monokromatik/i.test(s));
    if (site) {
      const end = new Date(); end.setDate(end.getDate() - 3);
      const start = new Date(end); start.setDate(start.getDate() - 28);
      const q = async (dim) => {
        const body = JSON.stringify({ startDate: ymd(start), endDate: ymd(end), dimensions: [dim], rowLimit: 10 });
        const r = await req('POST', `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, HJ, body);
        return r.status === 200 ? JSON.parse(r.body) : (console.log('  ! query', dim, r.status, r.body.slice(0, 120)), null);
      };
      console.log(`(${site}, ${ymd(start)}→${ymd(end)})`);
      const tot = await q('date');
      if (tot?.rows) { const c = tot.rows.reduce((a, r) => a + r.clicks, 0), i = tot.rows.reduce((a, r) => a + r.impressions, 0); console.log(`TOTAL: ${c} clicks, ${i} impressions, ${i ? (100 * c / i).toFixed(1) : 0}% CTR`); }
      const qq = await q('query');
      if (qq?.rows) { console.log('\nTOP QUERIES:'); qq.rows.forEach(r => console.log(`  ${String(r.clicks).padStart(4)} clk  ${String(r.impressions).padStart(6)} imp  pos ${r.position.toFixed(1).padStart(4)}  "${r.keys[0]}"`)); }
      const pp = await q('page');
      if (pp?.rows) { console.log('\nTOP PAGES (search):'); pp.rows.forEach(r => console.log(`  ${String(r.clicks).padStart(4)} clk  ${String(r.impressions).padStart(6)} imp  ${r.keys[0]}`)); }
    }
  }
  console.log('\nDONE');
})().catch(e => { console.error('ERR', e?.message || e); process.exit(1); });
