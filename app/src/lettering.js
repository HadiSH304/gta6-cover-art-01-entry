// The lettering, v2: a striped block title stretched full-width with a
// script subtitle overlapping it, per-panel caption chips, and the poster
// devices the top covers all carry — a press-quote + stars strip, a gold
// seal, a barcode, a billing block and a VOL. 1 ticket. Fonts are Anton and
// Pacifico, both SIL OFL files shipped under app/fonts/. Stars are drawn
// as paths, never as a glyph, so they render in any font.

/** Fit Anton to `maxWidth` by size, then stretch it wide to span the band.
 * Long titles shrink to fit; short ones stretch (capped) — the field's
 * best titles span 70–95% of the cover with chunky wide letters. */
export function drawStripedBlockTitle(ctx, text, cx, baselineY, maxWidth, maxSize) {
  const words = text.trim().toUpperCase();
  if (!words) return 0;
  let size = maxSize;
  ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
  let natural = ctx.measureText(words).width;
  if (natural > maxWidth) {
    size = Math.max(12, size * (maxWidth / natural));
    ctx.font = `${size}px Anton, 'Arial Black', sans-serif`;
    natural = ctx.measureText(words).width;
  }
  // Stretch wide until the title spans the band; the stretch is capped so
  // short titles stay chunky rather than smeared.
  const stretch = Math.min(1.7, maxWidth / natural);
  ctx.save();
  ctx.translate(cx, baselineY);
  ctx.scale(stretch, 1);
  // The gradient is built in the translated local space, so its bands land
  // on the letters: gradient coordinates are read in the transform that is
  // live when the text is painted.
  const grad = ctx.createLinearGradient(0, -size * 0.82, 0, size * 0.1);
  grad.addColorStop(0, '#ffe98a');
  grad.addColorStop(0.14, '#ffd21f');
  grad.addColorStop(0.16, '#7b2fbe');
  grad.addColorStop(0.3, '#9b30c9');
  grad.addColorStop(0.32, '#ff2e88');
  grad.addColorStop(0.46, '#ff5e8a');
  grad.addColorStop(0.48, '#ffe98a');
  grad.addColorStop(0.62, '#ffd76a');
  grad.addColorStop(0.64, '#c22a72');
  grad.addColorStop(0.78, '#ff2e88');
  grad.addColorStop(0.8, '#ffe98a');
  grad.addColorStop(0.92, '#ff8a3c');
  grad.addColorStop(1, '#ff2e88');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  // Drop shadow first, then the dark outline, then the striped fill.
  ctx.fillStyle = 'rgba(20, 4, 32, 0.85)';
  ctx.fillText(words, size * 0.03, size * 0.05);
  ctx.strokeStyle = '#1c0a2e';
  ctx.lineWidth = Math.max(3, size * 0.1);
  ctx.strokeText(words, 0, 0);
  ctx.fillStyle = grad;
  ctx.fillText(words, 0, 0);
  ctx.restore();
  return size;
}

/** Script subtitle in Pacifico, white with a pink glow, tilted a little. */
export function drawScriptSubtitle(ctx, text, cx, y, size, tilt = -0.045) {
  const words = text.trim();
  if (!words) return;
  ctx.save();
  ctx.translate(cx, y);
  ctx.rotate(tilt);
  ctx.font = `${size}px Pacifico, cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(28, 10, 46, 0.9)';
  ctx.lineWidth = Math.max(2, size * 0.08);
  ctx.strokeText(words, 0, 0);
  ctx.shadowColor = 'rgba(255, 46, 136, 0.9)';
  ctx.shadowBlur = size * 0.35;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(words, 0, 0);
  ctx.restore();
}

/** One five-point star path, centred at (cx, cy) with radius r. */
export function drawStar(ctx, cx, cy, r, color = '#ffd21f') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(a) * rad;
    const py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Press-quote strip: five gold stars, the quote, and its source. */
export function drawPressQuoteStrip(ctx, rect, quote, source) {
  const { x, y, w, h } = rect;
  const starR = h * 0.32;
  const gap = starR * 0.55;
  let sx = x + w * 0.02;
  for (let i = 0; i < 5; i++) {
    drawStar(ctx, sx + starR, y + h / 2, starR);
    sx += starR * 2 + gap;
  }
  const textX = sx + starR;
  ctx.save();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  let size = h * 0.52;
  ctx.font = `bold ${size}px Anton, sans-serif`;
  const quoteText = `“${quote.trim().toUpperCase()}”`;
  const sourceText = ` — ${source.trim().toUpperCase()}`;
  while (ctx.measureText(quoteText + sourceText).width > w * 0.98 - (textX - x) && size > 8) {
    size -= 1;
    ctx.font = `bold ${size}px Anton, sans-serif`;
  }
  ctx.fillStyle = '#ffe98a';
  ctx.fillText(quoteText, textX, y + h / 2 + size * 0.04);
  const quoteW = ctx.measureText(quoteText).width;
  ctx.fillStyle = '#c9b8d4';
  ctx.fillText(sourceText, textX + quoteW, y + h / 2 + size * 0.04);
  ctx.restore();
}

/** Gold VOL. 1 ticket: a gold slab with dark caps text. */
export function drawVolumeTicket(ctx, rect, text) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.fillStyle = '#ffd21f';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h * 0.18);
  ctx.fill();
  ctx.fillStyle = '#1c0a2e';
  let size = h * 0.52;
  ctx.font = `bold ${size}px Anton, sans-serif`;
  const words = text.trim().toUpperCase();
  while (ctx.measureText(words).width > w * 0.86 && size > 8) {
    size -= 1;
    ctx.font = `bold ${size}px Anton, sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(words, x + w / 2, y + h / 2 + size * 0.04);
  ctx.restore();
}

/** Gold seal: a serrated disc with two lines of dark caps text. */
export function drawGoldSeal(ctx, cx, cy, radius, line1, line2) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const spikes = 18;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.86;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  const gold = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
  gold.addColorStop(0, '#ffe98a');
  gold.addColorStop(0.6, '#ffd21f');
  gold.addColorStop(1, '#c9960a');
  ctx.fillStyle = gold;
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, radius * 0.05);
  ctx.strokeStyle = '#7a5200';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.74, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, radius * 0.04);
  ctx.strokeStyle = '#7a5200';
  ctx.stroke();
  ctx.fillStyle = '#4a2f00';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${radius * 0.26}px Anton, sans-serif`;
  ctx.fillText(line1.trim().toUpperCase(), 0, -radius * 0.16);
  ctx.font = `bold ${radius * 0.22}px Anton, sans-serif`;
  ctx.fillText(line2.trim().toUpperCase(), 0, radius * 0.16);
  drawStar(ctx, 0, radius * 0.44, radius * 0.13, '#4a2f00');
  ctx.restore();
}

/** Barcode: seeded bars with a digits line underneath. */
export function drawBarcode(ctx, rect, digits) {
  const { x, y, w, h } = rect;
  const barH = h * 0.68;
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  let seed = 0;
  for (const ch of digits) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  let bx = x + w * 0.04;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  ctx.fillStyle = '#0d0518';
  while (bx < x + w * 0.96) {
    const bw = (1 + Math.floor(rand() * 3)) * (w / 90);
    if (rand() > 0.42) ctx.fillRect(bx, y + h * 0.06, bw, barH);
    bx += bw + w / 90;
  }
  ctx.fillStyle = '#0d0518';
  ctx.font = `${Math.max(6, h * 0.16)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(digits, x + w / 2, y + barH + h * 0.18);
  ctx.restore();
}

/** Billing block: one line of small spaced caps, centred. */
export function drawBillingBlock(ctx, cx, y, maxWidth, size, text) {
  const words = text.trim().toUpperCase();
  if (!words) return;
  ctx.save();
  ctx.fillStyle = '#e8dcf0';
  let s = size;
  ctx.font = `${s}px Anton, sans-serif`;
  while (ctx.measureText(words).width > maxWidth && s > 7) {
    s -= 0.5;
    ctx.font = `${s}px Anton, sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(words, cx, y);
  ctx.restore();
}

/** Tagline bar: a black pill with gold spaced caps and pink chevrons. */
export function drawTaglineBar(ctx, rect, text) {
  const words = text.trim().toUpperCase();
  if (!words) return;
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.fillStyle = '#0d0518';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = '#ff2e88';
  ctx.lineWidth = Math.max(1, h * 0.06);
  ctx.stroke();
  ctx.fillStyle = '#ffd21f';
  let size = h * 0.5;
  ctx.font = `bold ${size}px Anton, sans-serif`;
  while (ctx.measureText(words).width > w * 0.84 && size > 7) {
    size -= 1;
    ctx.font = `bold ${size}px Anton, sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(words, x + w / 2, y + h / 2 + size * 0.05);
  // Pink chevrons point in from both ends of the bar.
  ctx.fillStyle = '#ff2e88';
  const chev = (cx) => {
    ctx.beginPath();
    ctx.moveTo(cx - h * 0.14, y + h * 0.28);
    ctx.lineTo(cx + h * 0.1, y + h / 2);
    ctx.lineTo(cx - h * 0.14, y + h * 0.72);
    ctx.lineTo(cx + h * 0.02, y + h / 2);
    ctx.closePath();
    ctx.fill();
  };
  chev(x + w * 0.045);
  ctx.save();
  ctx.translate(x + w * 0.955, y + h / 2);
  ctx.scale(-1, 1);
  ctx.translate(-(x + w * 0.955), -(y + h / 2));
  chev(x + w * 0.955);
  ctx.restore();
  ctx.restore();
}

/** Per-panel caption chip: a slanted dark chip, role on top, tagline below. */
export function drawPanelCaption(ctx, rect, line1, line2) {
  const top = (line1 ?? '').trim().toUpperCase();
  const bottom = (line2 ?? '').trim().toUpperCase();
  if (!top && !bottom) return;
  const { x, y, w, h } = rect;
  const pad = Math.max(4, w * 0.02);
  const slant = Math.max(4, h * 0.12);
  // Sizes scale with the panel's width, then shrink to fit the chip, so a
  // tall hero panel never gets a billboard-sized caption.
  let line1Size = Math.max(8, w * 0.085);
  let line2Size = Math.max(7, w * 0.055);
  ctx.save();
  ctx.font = `bold ${line1Size}px Anton, sans-serif`;
  const w1 = top ? ctx.measureText(top).width : 0;
  ctx.font = `${line2Size}px Anton, sans-serif`;
  const w2 = bottom ? ctx.measureText(bottom).width : 0;
  const maxTextW = w - pad * 3 - slant;
  const widest = Math.max(w1, w2);
  if (widest > maxTextW && widest > 0) {
    const shrink = maxTextW / widest;
    line1Size *= shrink;
    line2Size *= shrink;
  }
  ctx.font = `bold ${line1Size}px Anton, sans-serif`;
  const fitW1 = top ? ctx.measureText(top).width : 0;
  ctx.font = `${line2Size}px Anton, sans-serif`;
  const fitW2 = bottom ? ctx.measureText(bottom).width : 0;
  const chipW = Math.min(w - pad, Math.max(fitW1, fitW2) + pad * 2 + slant);
  const twoLines = Boolean(top && bottom);
  const chipH = twoLines ? line1Size + line2Size + pad * 1.7 : line1Size + pad * 1.4;
  // The chip sits clear of the panel's bottom edge, so the title band's
  // big letters never cover a caption.
  const cy = y + h - chipH - Math.max(3, h * 0.07);
  ctx.fillStyle = 'rgba(13, 5, 24, 0.88)';
  ctx.beginPath();
  ctx.moveTo(x, cy);
  ctx.lineTo(x + chipW, cy);
  ctx.lineTo(x + chipW - slant, cy + chipH);
  ctx.lineTo(x, cy + chipH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(x, cy, Math.max(2, w * 0.008), chipH);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  if (twoLines) {
    ctx.font = `bold ${line1Size}px Anton, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(top, x + pad * 1.4, cy + pad * 0.9 + line1Size * 0.5);
    ctx.font = `${line2Size}px Anton, sans-serif`;
    ctx.fillStyle = '#ffd21f';
    ctx.fillText(bottom, x + pad * 1.4, cy + pad * 0.9 + line1Size + line2Size * 0.45);
  } else {
    ctx.font = `bold ${line1Size}px Anton, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(top || bottom, x + pad * 1.4, cy + chipH / 2 + line1Size * 0.06);
  }
  ctx.restore();
}

/** Halftone dots over a rect: dark dots that fade toward the top. */
export function drawHalftoneBand(ctx, rect, step, maxAlpha) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.fillStyle = '#ffd21f';
  let row = 0;
  for (let yy = y; yy < y + h; yy += step, row++) {
    const f = (yy - y) / h;
    ctx.globalAlpha = maxAlpha * (0.25 + 0.75 * f);
    for (let xx = x + (row % 2) * step * 0.5; xx < x + w; xx += step) {
      ctx.beginPath();
      ctx.arc(xx, yy, Math.max(0.6, step * 0.1), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
