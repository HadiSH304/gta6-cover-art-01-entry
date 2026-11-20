// The lettering: a two-layer title (heavy block caps with a sunset gradient
// fill and a dark outline, plus a script subtitle overlapping it), a starburst
// badge, a tagline strip, and the designed title panel — a sunset backdrop
// with palm silhouettes drawn on canvas. Fonts are Anton and Pacifico, both
// SIL OFL files shipped under app/fonts/.

/** Fit Anton to `maxWidth`, then paint block caps with gradient + outline. */
export function drawBlockTitle(ctx, text, cx, baselineY, maxWidth, maxSize) {
  const words = text.trim().toUpperCase();
  if (!words) return 0;
  let size = maxSize;
  ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
  while (ctx.measureText(words).width > maxWidth && size > 12) {
    size -= 2;
    ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
  }
  const grad = ctx.createLinearGradient(0, baselineY - size, 0, baselineY + size * 0.12);
  grad.addColorStop(0, '#ffe98a');
  grad.addColorStop(0.45, '#ff8a3c');
  grad.addColorStop(1, '#ff2e88');
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1c0a2e';
  ctx.lineWidth = Math.max(3, size * 0.09);
  ctx.strokeText(words, cx, baselineY);
  ctx.fillStyle = grad;
  ctx.fillText(words, cx, baselineY);
  ctx.restore();
  return size;
}

/** Script subtitle in Pacifico, white with a pink glow, tilted a little. */
export function drawScriptSubtitle(ctx, text, cx, y, size, tilt = -0.05) {
  const words = text.trim();
  if (!words) return;
  ctx.save();
  ctx.translate(cx, y);
  ctx.rotate(tilt);
  ctx.font = `${size}px Pacifico, cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(255, 46, 136, 0.9)';
  ctx.shadowBlur = size * 0.35;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(words, 0, 0);
  ctx.restore();
}

/** One palm silhouette: a curved trunk and seven drooping fronds. */
export function drawPalm(ctx, x, y, height, color = '#1c0a2e') {
  const lean = height * 0.16;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, height * 0.035);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + lean * 0.4, y - height * 0.55, x + lean, y - height);
  ctx.stroke();
  const topX = x + lean;
  const topY = y - height;
  for (let i = 0; i < 7; i++) {
    const angle = Math.PI * (0.08 + (i / 6) * 0.84);
    const len = height * (0.42 + (i % 2) * 0.08);
    const endX = topX + Math.cos(angle) * len;
    const endY = topY + Math.sin(angle) * len * 0.72 + height * 0.12;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(angle) * len * 0.5,
      topY + Math.sin(angle) * len * 0.4 - height * 0.06,
      endX, endY,
    );
    ctx.stroke();
  }
  ctx.restore();
}

/** The sunset backdrop of a title panel: sky, sun disc, sea band, palms. */
export function drawTitlePanelBackdrop(ctx, rect) {
  const { x, y, w, h } = rect;
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, '#2b0a4a');
  sky.addColorStop(0.45, '#c22a72');
  sky.addColorStop(0.75, '#ff7a3c');
  sky.addColorStop(1, '#ffd76a');
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  // Sun disc sits upper-right, clear of the centred title and subtitle.
  const sunR = h * 0.12;
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(x + w * 0.88, y + h * 0.24, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1c0a2e';
  ctx.fillRect(x, y + h * 0.82, w, h * 0.18);
  // Palms stay low and at the edges so their fronds never cross the title.
  drawPalm(ctx, x + w * 0.05, y + h * 0.88, h * 0.42);
  drawPalm(ctx, x + w * 0.95, y + h * 0.88, h * 0.38);
  ctx.fillStyle = 'rgba(28, 10, 46, 0.25)';
  ctx.fillRect(x, y, w, h * 0.1);
}

/** Starburst badge with two lines of text, e.g. "NEW / SUMMER 2026". */
export function drawBadge(ctx, cx, cy, radius, line1, line2) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const spikes = 14;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.78;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd21f';
  ctx.fill();
  ctx.lineWidth = Math.max(2, radius * 0.06);
  ctx.strokeStyle = '#1c0a2e';
  ctx.stroke();
  ctx.fillStyle = '#1c0a2e';
  ctx.textAlign = 'center';
  ctx.font = `bold ${radius * 0.34}px Anton, sans-serif`;
  ctx.fillText(line1, 0, -radius * 0.02);
  ctx.font = `bold ${radius * 0.2}px Anton, sans-serif`;
  ctx.fillText(line2, 0, radius * 0.3);
  ctx.restore();
}

/** Tagline strip: a black bar with yellow spaced capitals. */
export function drawTaglineStrip(ctx, rect, text) {
  const words = text.trim().toUpperCase();
  if (!words) return;
  ctx.save();
  ctx.fillStyle = '#0d0518';
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = '#ffd21f';
  let size = rect.h * 0.52;
  ctx.font = `bold ${size}px Anton, sans-serif`;
  while (ctx.measureText(words).width > rect.w * 0.92 && size > 8) {
    size -= 1;
    ctx.font = `bold ${size}px Anton, sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(words, rect.x + rect.w / 2, rect.y + rect.h / 2 + size * 0.05);
  ctx.restore();
}
