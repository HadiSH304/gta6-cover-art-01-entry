// Fixed scenes for screenshots: ?shot=editor shows the editor with the sample
// photos loaded; ?shot=cover draws the cover alone at an export size, using
// the app's own renderer, so the shot is the cover the app exports.
// window.__shotReady is set once painted (and once the fonts are in).

import { LAYOUTS } from './panels.js';

/** Keep an editor input in sync with a shot's state value. */
function syncInput(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

export async function runShot(shot, query, state, { loadSample, redraw, fillSamples }) {
  const canvas = document.getElementById('cover');
  state.grade = query.get('grade') ?? 'sunset';
  state.title = query.get('title') ?? 'LEONIDA';
  state.subtitle = query.get('subtitle') ?? 'vice city nights';
  state.tagline = query.get('tagline') ?? 'FIVE FRIENDS · ONE COAST · NO WAY BACK';
  if (query.get('layout')) {
    state.layoutName = query.get('layout');
    state.layout = LAYOUTS[state.layoutName];
  }
  syncInput('title', state.title);
  syncInput('subtitle', state.subtitle);
  syncInput('tagline', state.tagline);
  syncInput('quote', state.quote);
  syncInput('quoteSource', state.quoteSource);
  syncInput('billing', state.billing);
  syncInput('volume', state.volume);
  syncInput('comingSoon', state.comingSoon);
  syncInput('seal1', state.sealLine1);
  syncInput('seal2', state.sealLine2);
  document.querySelectorAll('#grades button').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.grade);
  });
  const layoutSelect = document.getElementById('layout');
  if (layoutSelect) layoutSelect.value = state.layoutName;

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
