// Checks public/site.json and public/films.json before they go live.
// Run from anywhere: node scripts/check-content.mjs
// Prints every problem it finds and exits 1, or prints "Content OK".

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const FORMATS = ['Feature', 'Short', 'Documentary', 'Series'];
const STATUSES = ['Released', 'In production', 'In development'];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^(https?:\/\/|mailto:)\S+$/;

const problems = [];
const problem = (file, entry, message) => problems.push(`${file} › ${entry}: ${message}`);

const isText = (v) => typeof v === 'string' && v.trim() !== '';
const show = (v) => JSON.stringify(v);

// Vercel is case-sensitive even when this computer isn't, so match each folder and file name exactly.
function existsExactly(webPath) {
  let dir = PUBLIC;
  for (const part of webPath.replace(/^\//, '').split('/')) {
    let names;
    try { names = readdirSync(dir); } catch { return false; }
    if (!names.includes(part)) return false;
    dir = join(dir, part);
  }
  return true;
}

function readJSON(name) {
  let text;
  try { text = readFileSync(join(PUBLIC, name), 'utf8'); } catch {
    problem(name, 'file', 'could not be read. Is it still in public/?');
    return null;
  }
  try { return JSON.parse(text); } catch (err) {
    const pos = Number((err.message.match(/position (\d+)/) || [])[1]);
    const line = Number.isFinite(pos) && !/line \d/.test(err.message) ?` (around line ${text.slice(0, pos).split('\n').length})` : '';
    problem(name, 'file', `is not valid JSON${line}: ${err.message}. Usually a missing or extra comma or quotation mark.`);
    return null;
  }
}

function unknownKeys(file, entry, obj, allowed) {
  for (const key of Object.keys(obj)) {
    if (!allowed.includes(key)) problem(file, entry, `unknown key ${show(key)}. Allowed keys: ${allowed.join(', ')}.`);
  }
}

function checkImage(file, entry, key, value, folder) {
  if (!isText(value) || !value.startsWith('/')) {
    problem(file, entry, `${key} must be a path starting with "/", such as "${folder}name.jpg". Got ${show(value)}.`);
  } else if (!existsExactly(value)) {
    problem(file, entry, `${key} ${show(value)} does not exist at public${value}. Check the file is uploaded and the name matches exactly, including capitals.`);
  }
}

function checkPairs(file, entry, key, list, a, b, urlKey) {
  if (!Array.isArray(list)) return problem(file, entry, `${key} must be a list, such as [] for none. Got ${show(list)}.`);
  list.forEach((item, i) => {
    const where = `${key}[${i + 1}]`;
    if (!item || typeof item !== 'object' || Array.isArray(item)) return problem(file, entry, `${where} must look like { "${a}": "...", "${b}": "..." }.`);
    unknownKeys(file, `${entry} ${where}`, item, [a, b]);
    if (!isText(item[a])) problem(file, entry, `${where} needs a "${a}".`);
    if (!isText(item[b])) problem(file, entry, `${where} needs a "${b}".`);
    else if (b === urlKey && !URL_RE.test(item[b])) problem(file, entry, `${where} url ${show(item[b])} must start with https://.`);
  });
}

// ---- site.json ----

const SITE_TEXT = ['heroIntro', 'location', 'tagline', 'aboutHeadline', 'aboutShort', 'projectsIntro'];
const FOUNDER_KEYS = ['name', 'title', 'email', 'bio', 'photo'];

const site = readJSON('site.json');
if (site && (typeof site !== 'object' || Array.isArray(site))) {
  problem('site.json', 'file', 'must be one { ... } object.');
} else if (site) {
  const F = 'site.json';
  unknownKeys(F, 'top level', site, ['_note', ...SITE_TEXT, 'aboutLong', 'generalEmail', 'socials', 'founders']);
  if ('_note' in site && typeof site._note !== 'string') problem(F, '_note', 'must be text.');
  for (const key of SITE_TEXT) if (!isText(site[key])) problem(F, key, `is required and must be text. Got ${show(site[key])}.`);

  if (!Array.isArray(site.aboutLong) || site.aboutLong.length === 0) problem(F, 'aboutLong', 'must be a list with at least one paragraph.');
  else site.aboutLong.forEach((p, i) => { if (!isText(p)) problem(F, `aboutLong paragraph ${i + 1}`, 'must be text and not empty.'); });

  if (!isText(site.generalEmail) || !EMAIL.test(site.generalEmail)) problem(F, 'generalEmail', `${show(site.generalEmail)} does not look like an email address.`);

  checkPairs(F, 'socials', 'socials', site.socials, 'label', 'url', 'url');

  if (!Array.isArray(site.founders) || site.founders.length === 0) {
    problem(F, 'founders', 'must be a list with at least one founder.');
  } else {
    site.founders.forEach((f, i) => {
      const entry = `founder ${i + 1}${f && isText(f.name) ? ` (${f.name})` : ''}`;
      if (!f || typeof f !== 'object' || Array.isArray(f)) return problem(F, entry, 'must be a { ... } object.');
      unknownKeys(F, entry, f, FOUNDER_KEYS);
      for (const key of ['name', 'title', 'bio']) if (!isText(f[key])) problem(F, entry, `"${key}" is required and must be text.`);
      if (!isText(f.email) || !EMAIL.test(f.email)) problem(F, entry, `email ${show(f.email)} does not look like an email address.`);
      if (!('photo' in f)) problem(F, entry, '"photo" is required. Use null until there is a photo.');
      else if (f.photo !== null) checkImage(F, entry, 'photo', f.photo, '/assets/founders/');
    });
  }
}

// ---- films.json ----

const FILM_KEYS = ['slug', 'title', 'year', 'format', 'status', 'featured', 'still', 'synopsis', 'credits', 'links'];

const filmsFile = readJSON('films.json');
let films = null;
if (Array.isArray(filmsFile)) films = filmsFile;
else if (filmsFile && typeof filmsFile === 'object') {
  unknownKeys('films.json', 'top level', filmsFile, ['_note', 'films']);
  if ('_note' in filmsFile && typeof filmsFile._note !== 'string') problem('films.json', '_note', 'must be text.');
  if (Array.isArray(filmsFile.films)) films = filmsFile.films;
  else problem('films.json', 'films', 'must be a list of films.');
} else if (filmsFile !== null) problem('films.json', 'file', 'must be { "films": [ ... ] }.');

if (films) {
  const F = 'films.json';
  const seen = new Map();
  films.forEach((film, i) => {
    const entry = `film ${i + 1}${film && isText(film.title) ? ` (${film.title})` : ''}`;
    if (!film || typeof film !== 'object' || Array.isArray(film)) return problem(F, entry, 'must be a { ... } object.');
    unknownKeys(F, entry, film, FILM_KEYS);

    if (!isText(film.slug)) problem(F, entry, '"slug" is required.');
    else if (!SLUG.test(film.slug)) problem(F, entry, `slug ${show(film.slug)} must be lowercase letters and numbers joined by single hyphens, such as "night-swim".`);
    else if (seen.has(film.slug)) problem(F, entry, `slug ${show(film.slug)} is already used by film ${seen.get(film.slug)}. Every slug must be unique.`);
    if (isText(film.slug)) seen.set(film.slug, seen.get(film.slug) || i + 1);

    if (!isText(film.title)) problem(F, entry, '"title" is required and must be text.');
    if (!(film.year === null || (typeof film.year === 'string' && /^\d{4}$/.test(film.year)))) problem(F, entry, `year must be four digits in quotes, such as "2026", or null. Got ${show(film.year)}.`);
    if (!FORMATS.includes(film.format)) problem(F, entry, `format ${show(film.format)} must be one of ${FORMATS.map(show).join(', ')}.`);
    if (!STATUSES.includes(film.status)) problem(F, entry, `status ${show(film.status)} must be one of ${STATUSES.map(show).join(', ')}.`);
    if ('featured' in film && typeof film.featured !== 'boolean') problem(F, entry, `featured must be true or false, without quotes. Got ${show(film.featured)}.`);
    checkImage(F, entry, 'still', film.still, '/assets/films/');
    if (!isText(film.synopsis)) problem(F, entry, '"synopsis" is required and must be text.');
    checkPairs(F, entry, 'credits', film.credits, 'role', 'name');
    checkPairs(F, entry, 'links', film.links, 'label', 'url', 'url');
  });
  if (films.length === 0) problem(F, 'films', 'is empty. The Projects page needs at least one film.');
}

if (problems.length) {
  console.error(`${problems.length} problem${problems.length === 1 ? '' : 's'} found:\n`);
  for (const p of problems) console.error(`- ${p}`);
  process.exit(1);
}
console.log('Content OK');
