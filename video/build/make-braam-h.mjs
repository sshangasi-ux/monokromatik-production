#!/usr/bin/env node
// Horizontal (1920x1080) Braam explainer — the landscape sibling of
// make-braam-short.mjs. Assembles hf-scenes.json + hf-manifest-h.json from an
// article's scene data, explicit bespoke Higgsfield clips, and pre-generated
// Braam VO wavs, then renders HiggsfieldExplainerH.
//
//   node build/make-braam-h.mjs \
//     --slug <article-slug> --scenes 1,2,3,4,5,6,7,8,9 \
//     --clips hf/bhclip1.mp4,... --vo hf/beer-s1.wav,... --out beer-value-h
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const args = Object.fromEntries(process.argv.slice(2).flatMap((a, i, arr) =>
  a.startsWith('--') ? [[a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]] : []));
const { slug, out } = args;
const sceneIds = String(args.scenes || '').split(',').map((s) => Number(s.trim())).filter(Boolean);
const clipPaths = String(args.clips || '').split(',').map((s) => s.trim()).filter(Boolean);
const voPaths = String(args.vo || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!slug || !out || sceneIds.length !== voPaths.length || sceneIds.length !== clipPaths.length) {
  console.error('usage: --slug <slug> --scenes 1,2,3 --clips hf/a.mp4,... --vo hf/a.wav,... --out <basename>');
  process.exit(1);
}

const HERE = new URL('.', import.meta.url).pathname;     // video/build/
const VIDEO = HERE.replace(/build\/$/, '');               // video/
const genPath = `${VIDEO}build/generated/${slug}.scenes.json`;
if (!existsSync(genPath)) {
  execSync(`node build/scene-data-from-article.mjs ${slug}`, { cwd: VIDEO, stdio: 'inherit' });
}
const gen = JSON.parse(readFileSync(genPath, 'utf8'));
const byId = Object.fromEntries(gen.scenes.map((s) => [s.id, s]));

const durOf = (relPath) => {
  const info = execSync(`afinfo ${JSON.stringify(`${VIDEO}public/${relPath}`)}`).toString();
  return parseFloat((info.match(/estimated duration:\s*([\d.]+)/) || [])[1] || '8');
};

const scenes = [];
const manifest = [];
sceneIds.forEach((id, k) => {
  const scn = byId[id];
  if (!scn) { console.error(`scene id ${id} not in ${slug} scene data`); process.exit(1); }
  scenes.push({ id, kind: scn.kind, ...(scn.accent !== undefined ? { accent: scn.accent } : {}), overlay: scn.overlay });
  manifest.push({ i: id, clip: clipPaths[k], audio: voPaths[k], voDur: durOf(voPaths[k]) });
});

writeFileSync(`${VIDEO}src/hf-scenes.json`, JSON.stringify(scenes, null, 2));
writeFileSync(`${VIDEO}src/hf-manifest-h.json`, JSON.stringify(manifest, null, 2));
console.log(`scenes ${sceneIds.join('→')} | ${manifest.reduce((a, m) => a + m.voDur, 0).toFixed(1)}s`);

const env = { ...process.env, DYLD_LIBRARY_PATH: `${VIDEO}node_modules/@remotion/compositor-darwin-arm64` };
execSync(`node_modules/.bin/remotion render src/index.ts HiggsfieldExplainerH out/${out}.mp4`, { cwd: VIDEO, stdio: 'inherit', env });
console.log(`\n✓ Rendered out/${out}.mp4`);
