// Fixed scenes for screenshots: ?shot=editor shows the editor with the sample
// photos loaded; ?shot=cover draws the cover alone at an export size, using
// the app's own renderer, so the shot is the cover the app exports.
// window.__shotReady is set once painted (and once the fonts are in).

import { LAYOUTS } from './panels.js';

export async function runShot(shot, query, state, { loadSample, redraw, fillSamples }) {
  const canvas = document.getElementById('cover');
  state.grade = query.get('grade') ?? 'poster';
  state.title = query.get('title') ?? 'LEONIDA';
  state.subtitle = query.get('subtitle') ?? 'vice city nights';
  state.tagline = query.get('tagline') ?? 'EVERYTHING IN EXCESS';
  if (query.get('layout')) {
    state.layoutName = query.get('layout');
    state.layout = LAYOUTS[state.layoutName];
  }
  const titleEl = document.getElementById('title');
  const subtitleEl = document.getElementById('subtitle');
  const taglineEl = document.getElementById('tagline');
  if (titleEl) titleEl.value = state.title;
  if (subtitleEl) subtitleEl.value = state.subtitle;
  if (taglineEl) taglineEl.value = state.tagline;
  document.querySelectorAll('#grades button').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.grade);
  });

  await fillSamples();
  await document.fonts.load('100px Anton');
  await document.fonts.load('60px Pacifico');
  await document.fonts.ready;

  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const [w, h] = (query.get('size') ?? '1920x1080').split('x').map(Number);
    canvas.width = w;
    canvas.height = h;
  }
  redraw();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
