// Export: render the cover at an exact post size and download it as a PNG.
// Photos never leave the machine; the file is written locally by the browser.

import { drawCover } from './cover.js';

export const EXPORT_SIZES = {
  '1920x1080': [1920, 1080],
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
};

/** Render `state` at `sizeName` and download the PNG. Resolves to the file name. */
export function exportCoverPng(state, sizeName) {
  const [w, h] = EXPORT_SIZES[sizeName];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  drawCover(canvas, state);
  const name = `vice-cover-${sizeName}.png`;
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve(name);
    }, 'image/png');
  });
}
