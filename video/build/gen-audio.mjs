import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { SCENES } from './scenes.mjs';

const DIR = new URL('../audio/', import.meta.url).pathname;
mkdirSync(DIR, { recursive: true });
const VOICE = 'Tessa';   // en_ZA — South African, on-brand
const RATE = 168;        // measured brand-intelligence pace

const manifest = [];
for (const s of SCENES) {
  const aiff = `${DIR}${s.id}.aiff`;
  const m4a = `${DIR}${s.id}.m4a`;
  // synthesize
  execSync(`say -v ${VOICE} -r ${RATE} -o ${JSON.stringify(aiff)} ${JSON.stringify(s.vo)}`);
  // convert aiff -> aac/m4a (Remotion-friendly), no ffmpeg needed
  execSync(`afconvert ${JSON.stringify(aiff)} ${JSON.stringify(m4a)} -f m4af -d aac`);
  // measure duration
  const info = execSync(`afinfo ${JSON.stringify(m4a)}`).toString();
  const dur = parseFloat((info.match(/estimated duration:\s*([\d.]+)/) || [])[1] || '0');
  manifest.push({ id: s.id, file: `audio/${s.id}.m4a`, durationSec: dur });
  console.log(`  ${s.id.padEnd(9)} ${dur.toFixed(2)}s`);
}
const total = manifest.reduce((a, b) => a + b.durationSec, 0);
writeFileSync(new URL('../src/audio-manifest.json', import.meta.url), JSON.stringify(manifest, null, 2) + '\n');
console.log(`\ntotal VO: ${total.toFixed(1)}s across ${manifest.length} scenes → src/audio-manifest.json`);
