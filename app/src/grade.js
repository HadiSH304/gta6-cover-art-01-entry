// One heavy colour grade over every photo panel, so different photos cohere
// into one poster. Sunset is a warm photo grade, Neon Nights a magenta/cyan
// night grade, and Poster is the field's #1 look: posterize + halftone dots +
// duotone, built from raw ImageData so it runs with no library.

export const GRADES = ['sunset', 'neon', 'poster'];

const DUOTONE = [
  [30, 11, 46], // deep violet shadows
  [122, 30, 94], // magenta low-mids
  [255, 46, 136], // hot pink mids
  [255, 138, 60], // orange high-mids
  [255, 215, 106], // pale gold highlights
];

/** Quantize one channel to `levels` steps (posterize). */
function posterizeChannel(value, levels) {
  return Math.round((value / 255) * (levels - 1)) * (255 / (levels - 1));
}

/** Map a 0..255 luminance through the duotone ramp. */
function duotoneRamp(lum) {
  const t = (lum / 255) * (DUOTONE.length - 1);
  const i = Math.min(DUOTONE.length - 2, Math.floor(t));
  const f = t - i;
  const a = DUOTONE[i];
  const b = DUOTONE[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

/** Posterize + duotone an ImageData in place, then stamp halftone dots over it. */
function posterGrade(image, width, height) {
  const data = image.data;
  const lum = new Float32Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const r = posterizeChannel(data[i], 4);
    const g = posterizeChannel(data[i + 1], 4);
    const b = posterizeChannel(data[i + 2], 4);
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    lum[i / 4] = l;
    const [dr, dg, db] = duotoneRamp(l);
    data[i] = dr;
    data[i + 1] = dg;
    data[i + 2] = db;
  }
  return lum;
}

/** Halftone dots: black dots whose size grows as the picture darkens. */
function halftoneDots(ctx, lum, width, height, step) {
  ctx.save();
  ctx.fillStyle = '#160818';
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const l = lum[Math.min(width * height - 1, (y + step / 2) * width + (x + step / 2)) | 0];
      const radius = ((255 - l) / 255) * step * 0.42;
      if (radius < 0.4) continue;
      ctx.globalAlpha = 0.32;
      ctx.beginPath();
      ctx.arc(x + step / 2, y + step / 2, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * Grade a photo already drawn onto `canvas` (the canvas is the panel, at
 * panel pixels). Sunset and Neon use canvas filters; Poster rewrites pixels.
 */
export function gradePanelCanvas(canvas, grade) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  // Snapshot first: drawing a canvas onto itself is not reliable, so the
  // filtered pass always reads from a separate copy.
  const snap = document.createElement('canvas');
  snap.width = width;
  snap.height = height;
  snap.getContext('2d').drawImage(canvas, 0, 0);
  if (grade === 'sunset') {
    ctx.filter = 'saturate(1.3) contrast(1.08) sepia(0.22)';
    ctx.drawImage(snap, 0, 0);
    ctx.filter = 'none';
    const warm = ctx.createLinearGradient(0, 0, 0, height);
    warm.addColorStop(0, 'rgba(255, 120, 60, 0.05)');
    warm.addColorStop(1, 'rgba(255, 40, 120, 0.18)');
    ctx.fillStyle = warm;
    ctx.fillRect(0, 0, width, height);
  } else if (grade === 'neon') {
    ctx.filter = 'saturate(1.5) contrast(1.15) hue-rotate(-12deg)';
    ctx.drawImage(snap, 0, 0);
    ctx.filter = 'none';
    const top = ctx.createLinearGradient(0, 0, 0, height);
    top.addColorStop(0, 'rgba(255, 46, 136, 0.16)');
    top.addColorStop(0.5, 'rgba(120, 40, 180, 0.05)');
    top.addColorStop(1, 'rgba(0, 220, 255, 0.14)');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, width, height);
  } else {
    const image = ctx.getImageData(0, 0, width, height);
    const lum = posterGrade(image, width, height);
    ctx.putImageData(image, 0, 0);
    const step = Math.max(5, Math.round(width / 260));
    halftoneDots(ctx, lum, width, height, step);
  }
  // A light vignette pulls every panel toward the same poster mood.
  const edge = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.35,
    width / 2, height / 2, Math.max(width, height) * 0.75,
  );
  edge.addColorStop(0, 'rgba(0, 0, 0, 0)');
  edge.addColorStop(1, 'rgba(10, 4, 20, 0.22)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, width, height);
}
