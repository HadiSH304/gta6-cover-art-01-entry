// Leonida Cover Studio v2 — a gta6-cover-art-01 entry (Node 22, standard
// library only): the app is this directory's app/ folder, plain static files
// a desktop browser loads offline (app/index.html and its ES modules, the
// Anton and Pacifico fonts under app/fonts/, no library and no network
// request), and the program hands it in. It copies app/ and screenshots/
// from beside this file to /output and writes /output/dossier.json, the
// summary the judge reads, with the vendored make.fun library. The app turns
// a person's own photos into a multi-panel Vice City poster — seven
// captioned panels with a recurring cast, a warm photographic Sunset grade
// (a softened Poster grade stays as an option), and a full-width title band
// with a striped block title, an overlapping script subtitle, a press-quote
// strip, a gold seal, a barcode, a billing block and a VOL. 1 ticket —
// exported as a PNG at 1920x1080, 1080x1080 or 1080x1350. Its six sample
// photos (app/samples/) were made with an image model and are free to use.
// Put 3 or 4 PNG or JPEG screenshots in screenshots/ (the first by name is
// the cover) and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// The entry's own name, kept beside the copy so the dossier and the app agree.
const APP_TITLE = 'Leonida Cover Studio';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** Copy one entry directory (app/ or screenshots/) into /output. */
function copyEntry(name) {
  const source = join(here, name);
  const target = join(out, name);
  mkdirSync(target, { recursive: true });
  if (existsSync(source)) cpSync(source, target, { recursive: true });
}

mkdirSync(out, { recursive: true });
copyEntry('app');
copyEntry('screenshots');

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

writeFileSync(join(out, 'dossier.json'), buildDossier(out, DOSSIER_CAPS));

console.log(`${APP_TITLE}: wrote ${out}`);
