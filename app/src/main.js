// Leonida Cover Studio — wires the editor: photo panels with drag-to-pan
// and wheel-to-zoom crops, the two-layer caption editor, grade presets,
// layout choice and PNG export. A `?shot=` query sets up a fixed scene for
// screenshots instead (./shots.js).

import { LAYOUTS } from './panels.js';
import { drawCover } from './cover.js';
import { exportCoverPng, EXPORT_SIZES } from './export.js';
import { runShot } from './shots.js';

export const SAMPLE_PHOTOS = ['portrait', 'palms', 'skyline', 'driver', 'pier', 'boulevard'];

export const CAPTION_PRESETS = [
  { title: 'LEONIDA', subtitle: 'vice city nights', tagline: 'EVERYTHING IN EXCESS' },
  { title: 'KEYS TO PARADISE', subtitle: 'one last score', tagline: 'GATEWAY TO PARADISE' },
  { title: 'OCEAN BEACH', subtitle: 'deco nights', tagline: 'VICE BEACH, LEONIDA' },
  { title: 'SUNSET HEIST', subtitle: 'ocean drive', tagline: 'IN STORES SOMEWHERE SOON' },
  { title: 'GRASSRIVERS', subtitle: 'welcome to the wetlands', tagline: 'LIVE HARD' },
  { title: 'STARFISH ISLAND', subtitle: 'money talks', tagline: 'EVERYTHING IN EXCESS' },
];

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const panelList = document.getElementById('panels');

function defaultCrops(layout) {
  const crops = {};
  for (const panel of layout) if (!panel.title) crops[panel.id] = { zoom: 1, ox: 0, oy: 0 };
  return crops;
}

export const state = {
  layout: LAYOUTS.collage,
  layoutName: 'collage',
  grade: 'poster',
  photos: {},
  crops: defaultCrops(LAYOUTS.collage),
  title: 'LEONIDA',
  subtitle: 'vice city nights',
  tagline: 'EVERYTHING IN EXCESS',
  badgeLine1: 'NEW',
  badgeLine2: 'SUMMER 2026',
  showBadge: true,
  exportSize: '1920x1080',
};

let selectedPanel = 'hero';
let redrawQueued = false;

export function redraw() {
  if (redrawQueued) return;
  redrawQueued = true;
  requestAnimationFrame(() => {
    redrawQueued = false;
    drawCover(canvas, state);
  });
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadSample(name) {
  return loadImage(`samples/${name}.jpg`);
}

/** Fill every empty panel with the sample photos, in layout order. */
export async function fillSamples() {
  const photoPanels = state.layout.filter((p) => !p.title);
  for (let i = 0; i < photoPanels.length; i++) {
    const panel = photoPanels[i];
    if (!state.photos[panel.id]) {
      state.photos[panel.id] = await loadSample(panel.sample ?? SAMPLE_PHOTOS[i % SAMPLE_PHOTOS.length]);
    }
  }
  redraw();
}

function buildPanelList() {
  panelList.innerHTML = '';
  for (const panel of state.layout) {
    if (panel.title) continue;
    const row = document.createElement('div');
    row.className = 'panel-row' + (panel.id === selectedPanel ? ' selected' : '');
    const name = document.createElement('button');
    name.type = 'button';
    name.className = 'panel-name';
    name.textContent = panel.label;
    name.addEventListener('click', () => { selectedPanel = panel.id; buildPanelList(); redraw(); });
    const file = document.createElement('label');
    file.className = 'panel-file';
    file.textContent = 'Photo';
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      state.photos[panel.id] = await loadImage(URL.createObjectURL(f));
      state.crops[panel.id] = { zoom: 1, ox: 0, oy: 0 };
      status.textContent = `${panel.label} photo loaded. Drag on the preview to pan, scroll to zoom.`;
      redraw();
    });
    file.appendChild(input);
    const fill = document.createElement('button');
    fill.type = 'button';
    fill.textContent = 'Fill all';
    fill.addEventListener('click', async () => {
      const photo = state.photos[panel.id];
      if (!photo) return;
      for (const p of state.layout) if (!p.title) state.photos[p.id] = photo;
      status.textContent = 'One photo fills every panel.';
      redraw();
    });
    row.append(name, file, fill);
    panelList.appendChild(row);
  }
}

// Drag to pan the selected panel's photo; wheel to zoom it.
function canvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
}

function hitPanel(point) {
  const gutter = Math.max(2, Math.round(canvas.width * 0.006));
  for (const panel of state.layout) {
    if (panel.title) continue;
    if (point.x >= panel.x && point.x <= panel.x + panel.w &&
        point.y >= panel.y && point.y <= panel.y + panel.h) return panel;
  }
  return null;
}

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const panel = hitPanel(canvasPoint(e));
  if (!panel) return;
  selectedPanel = panel.id;
  buildPanelList();
  drag = { panel, start: canvasPoint(e), crop: { ...state.crops[panel.id] } };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const now = canvasPoint(e);
  const crop = state.crops[drag.panel.id];
  crop.ox = Math.max(-0.5, Math.min(0.5, drag.crop.ox + (now.x - drag.start.x) / drag.panel.w));
  crop.oy = Math.max(-0.5, Math.min(0.5, drag.crop.oy + (now.y - drag.start.y) / drag.panel.h));
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (e) => {
  const panel = hitPanel(canvasPoint(e));
  if (!panel) return;
  e.preventDefault();
  const crop = state.crops[panel.id];
  crop.zoom = Math.max(1, Math.min(4, crop.zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
  selectedPanel = panel.id;
  buildPanelList();
  redraw();
}, { passive: false });

function bindText(id, key) {
  const el = document.getElementById(id);
  el.addEventListener('input', () => { state[key] = el.value; redraw(); });
  return el;
}

const titleInput = bindText('title', 'title');
const subtitleInput = bindText('subtitle', 'subtitle');
const taglineInput = bindText('tagline', 'tagline');
const badge1Input = bindText('badge1', 'badgeLine1');
const badge2Input = bindText('badge2', 'badgeLine2');

document.getElementById('presets').addEventListener('click', (e) => {
  const button = e.target.closest('button[data-preset]');
  if (!button) return;
  const preset = CAPTION_PRESETS[Number(button.dataset.preset)];
  state.title = preset.title;
  state.subtitle = preset.subtitle;
  state.tagline = preset.tagline;
  titleInput.value = preset.title;
  subtitleInput.value = preset.subtitle;
  taglineInput.value = preset.tagline;
  redraw();
});

document.getElementById('grades').addEventListener('click', (e) => {
  const button = e.target.closest('button[data-grade]');
  if (!button) return;
  state.grade = button.dataset.grade;
  document.querySelectorAll('#grades button').forEach((b) => b.classList.toggle('active', b === button));
  status.textContent = `Grade: ${button.textContent}.`;
  redraw();
});

document.getElementById('layout').addEventListener('change', (e) => {
  state.layoutName = e.target.value;
  state.layout = LAYOUTS[state.layoutName];
  state.crops = defaultCrops(state.layout);
  buildPanelList();
  fillSamples();
});

document.getElementById('showBadge').addEventListener('change', (e) => {
  state.showBadge = e.target.checked;
  redraw();
});

document.getElementById('sizes').addEventListener('click', (e) => {
  const button = e.target.closest('button[data-size]');
  if (!button) return;
  state.exportSize = button.dataset.size;
  document.querySelectorAll('#sizes button').forEach((b) => b.classList.toggle('active', b === button));
});

document.getElementById('export').addEventListener('click', async () => {
  status.textContent = 'Rendering PNG…';
  const name = await exportCoverPng(state, state.exportSize);
  status.textContent = `Saved ${name} — your photos never left this machine.`;
});

document.getElementById('loadSamples').addEventListener('click', fillSamples);

// Drop a photo straight onto the preview: it lands in the panel under it.
canvas.addEventListener('dragover', (e) => e.preventDefault());
canvas.addEventListener('drop', async (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  const panel = hitPanel(canvasPoint(e));
  if (!file || !panel) return;
  state.photos[panel.id] = await loadImage(URL.createObjectURL(file));
  state.crops[panel.id] = { zoom: 1, ox: 0, oy: 0 };
  status.textContent = `${panel.label} photo loaded from drop.`;
  redraw();
});

buildPanelList();
const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), state, { loadSample, redraw, fillSamples });
} else {
  document.fonts.ready.then(() => redraw());
  redraw();
}
