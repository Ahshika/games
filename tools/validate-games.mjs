#!/usr/bin/env node
/**
 * Validates data/games.json before the site is published (run by .github/workflows/validate.yml).
 * The key rule: this portfolio shows GAMES only. Software belongs to https://ahshika.github.io/.
 * No dependencies; mirrors validateGamesFile() of the automation's @ada/portfolio package.
 *   node tools/validate-games.mjs [path/to/games.json]
 */
import { existsSync, readFileSync } from 'node:fs';

const PLATFORMS = new Set(['WINDOWS', 'MACOS', 'LINUX', 'ANDROID', 'IOS', 'WEB', 'CONSOLE']);
const STATUS = new Set(['Released', 'In development', 'Prototype']);
const ID = /^[a-z0-9][a-z0-9-]{0,62}$/;
const COVER = /^assets\/[a-z0-9._-]+\.(png|jpe?g|webp|avif)$/i;
const isStr = (v, max = 2000) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const isUrl = (v) => {
  if (typeof v !== 'string' || v.length > 2048) return false;
  try { return new URL(v).protocol === 'https:'; } catch { return false; }
};
const repoKey = (u) => u.trim().replace(/\/+$/, '').toLowerCase();

export function validate(f) {
  const errors = [];
  if (!f || typeof f !== 'object') return ['file must be a JSON object'];
  if (f.version !== 1) errors.push('version must be 1');
  if (!Array.isArray(f.games)) return [...errors, 'games must be a list'];
  if (f.games.length > 500) errors.push('at most 500 games');
  const ids = new Set();
  const repos = new Set();
  f.games.forEach((e, i) => {
    const w = `games[${i}]${e && typeof e.id === 'string' ? ` (${e.id})` : ''}`;
    if (!e || typeof e !== 'object') return void errors.push(`${w}: must be an object`);
    if (e.family !== 'GAME') errors.push(`${w}: only GAME entries belong in this portfolio (got ${e.family}); software goes to ahshika.github.io`);
    if (typeof e.id !== 'string' || !ID.test(e.id)) errors.push(`${w}: id must be lowercase letters, digits and dashes`);
    else if (ids.has(e.id)) errors.push(`${w}: duplicate id`);
    else ids.add(e.id);
    if (!isStr(e.name, 120)) errors.push(`${w}: name is required`);
    if (!isStr(e.tagline, 400)) errors.push(`${w}: tagline is required`);
    if (!isStr(e.genre, 40)) errors.push(`${w}: genre is required`);
    if (!Array.isArray(e.points) || e.points.some((p) => !isStr(p))) errors.push(`${w}: points must be a list of text`);
    if (!Array.isArray(e.platforms) || e.platforms.some((p) => !PLATFORMS.has(p))) errors.push(`${w}: unknown platform`);
    if (!Array.isArray(e.tech) || e.tech.some((s) => !isStr(s, 60))) errors.push(`${w}: tech must be a list of text`);
    if (!STATUS.has(e.status)) errors.push(`${w}: status must be Released, In development or Prototype`);
    if (e.repo !== undefined) {
      if (!isUrl(e.repo)) errors.push(`${w}: repo must be an https URL`);
      else if (repos.has(repoKey(e.repo))) errors.push(`${w}: repository listed twice`);
      else repos.add(repoKey(e.repo));
    }
    if (e.live !== undefined && !isUrl(e.live)) errors.push(`${w}: live must be an https URL`);
    if (e.downloads !== undefined && (!Array.isArray(e.downloads) || e.downloads.some((d) => !d || !isStr(d.label, 80) || !isUrl(d.url)))) errors.push(`${w}: downloads need a label and an https URL`);
    if (e.cover !== undefined) {
      if (typeof e.cover !== 'string' || !COVER.test(e.cover)) errors.push(`${w}: cover must be an image under assets/`);
      else if (!existsSync(e.cover)) errors.push(`${w}: cover file ${e.cover} is missing`);
    }
    if (e.source !== 'ada' && e.source !== 'manual') errors.push(`${w}: source must be "ada" or "manual"`);
  });
  return errors;
}

if (process.argv[1]?.endsWith('validate-games.mjs')) {
  const path = process.argv[2] ?? 'data/games.json';
  let data;
  try {
    data = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    console.error(`${path}: not valid JSON (${e.message})`);
    process.exit(1);
  }
  const errors = validate(data);
  if (errors.length) {
    console.error(`Games validation failed (${errors.length}):\n- ${errors.join('\n- ')}`);
    process.exit(1);
  }
  console.log(`OK: ${data.games.length} games, no software.`);
}
