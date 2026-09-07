#!/usr/bin/env node
// Assemble + render a vertical Braam Short from an article's scene data, a set of
// pre-generated Braam VO wavs, and the committed generic template clips
// (video/public/hf-template/). Deterministic: the agent only picks the flagship,
// writes the VO text, and generates the VO (Higgsfield MCP); this does the rest.
//
//   node build/make-braam-short.mjs \
//     --slug <article-slug> --scenes 2,6,7 \
//     --vo hf/gc1.wav,hf/gc2.wav,hf/gc3.wav \
//     --out great-convergence-short
//
// scenes  = scene ids (from build/generated/<slug>.scenes.json) in play order.
// vo      = public/-relative wav paths, one per scene, same order.
// Renders out/<out>.mp4 (1080x1920). Upload separately with youtube-upload.mjs.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const args = Object.fromEntries(process.argv.slice(2).flatMap((a, i, arr) =>
  a.startsWith('--') ? [[a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]] : []));
const { slug, out } = args;
const sceneIds = String(args.scenes || '').split(',').map((s) => Number(s.trim())).filter(Boolean);
const voPaths = String(args.vo || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!slug || !out || !sceneIds.length || sceneIds.length !== voPaths.length) {
  console.error('usage: --slug <slug> --scenes 2,6,7 --vo hf/a.wav,hf/b.wav,hf/c.wav --out <basename>');
  process.exit(1);
}

const HERE = new URL('.', import.meta.url).pathname;      // video/build/
const VIDEO = HERE.replace(/build\/$/, '');                // video/
const genPath = `${VIDEO}build/generated/${slug}.scenes.json`;
if (!existsSync(genPath)) {
  console.log(`Generating scene data for ${slug}…`);
  execSync(`node build/scene-data-from-article.mjs ${slug}`, { cwd: VIDEO, stdio: 'inherit' });
}
const gen = JSON.parse(readFileSync(genPath, 'utf8'));
const byId = Object.fromEntries(gen.scenes.map((s) => [s.id, s]));

// Generic template clips (committed, stable). The "pull" scene gets the quote clip;
// others rotate through the money/offshore/contract/cards set for a little variety.
const POOL = ['hf-template/tpl-money.mp4', 'hf-template/tpl-offshore.mp4', 'hf-template/tpl-contract.mp4', 'hf-template/tpl-cards.mp4'];
const QUOTE = 'hf-template/tpl-quote.mp4';
const durOf = (relPath) => {
  const info = execSync(`afinfo ${JSON.stringify(`${VIDEO}public/${relPath}`)}`).toString();
  return parseFloat((info.match(/estimated duration:\s*([\d.]+)/) || [])[1] || '6');
};

const scenes = [];
const manifest = [];
let poolI = 0;
sceneIds.forEach((id, k) => {
  const scn = byId[id];
  if (!scn) { console.error(`scene id ${id} not in ${slug} scene data`); process.exit(1); }
  scenes.push({ id, kind: scn.kind, ...(scn.accent !== undefined ? { accent: scn.accent } : {}), overlay: scn.overlay });
  const clip = scn.kind === 'pull' ? QUOTE : POOL[poolI++ % POOL.length];
  manifest.push({ i: id, clip, audio: voPaths[k], voDur: durOf(voPaths[k]) });
});

writeFileSync(`${VIDEO}src/hf-scenes.json`, JSON.stringify(scenes, null, 2));
writeFileSync(`${VIDEO}src/hf-manifest.json`, JSON.stringify(manifest, null, 2));
console.log(`scenes ${sceneIds.join('→')} | ${manifest.reduce((a, m) => a + m.voDur, 0).toFixed(1)}s`);

const env = { ...process.env, DYLD_LIBRARY_PATH: `${VIDEO}node_modules/@remotion/compositor-darwin-arm64` };
execSync(`node_modules/.bin/remotion render src/index.ts HiggsfieldExplainer out/${out}.mp4`, { cwd: VIDEO, stdio: 'inherit', env });
console.log(`\n✓ Rendered out/${out}.mp4 — upload with:\n  node build/youtube-upload.mjs --file out/${out}.mp4 --slug ${slug} --privacy public --title "<hook> #Shorts"`);
