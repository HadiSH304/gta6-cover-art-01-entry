// Renders the whole cover onto a canvas at the canvas's own size: a
// press-quote strip across the top, seven captioned photo panels with the
// shared grade, then a full-width title band — striped block title with a
// script subtitle overlapping it, a tagline bar, a billing block, a gold
// seal, a barcode and a VOL. 1 ticket. The same function draws the live
// preview and the exported PNG, so the screenshots show exactly what the
// app exports.

import { panelRect, BAND_TOP } from './panels.js';
import { gradePanelCanvas } from './grade.js';
import {
  drawStripedBlockTitle,
  drawScriptSubtitle,
  drawPressQuoteStrip,
  drawVolumeTicket,
  drawGoldSeal,
  drawBarcode,
  drawBillingBlock,
  drawTaglineBar,
  drawPanelCaption,
  drawHalftoneBand,
} from './lettering.js';

const GUTTER_FRAC = 0.006;

/** Cover-fit draw of one photo into a panel rect, with zoom and pan. */
function drawPhotoInto(ctx, photo, rect, crop) {
  const { zoom, ox, oy } = crop;
  const base = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight);
  const scale = base * zoom;
  const dw = photo.naturalWidth * scale;
  const dh = photo.naturalHeight * scale;
  const dx = rect.x + (rect.w - dw) / 2 + ox * rect.w;
  const dy = rect.y + (rect.h - dh) / 2 + oy * rect.h;
  ctx.drawImage(photo, dx, dy, dw, dh);
}

/** Paint one photo panel: photo, grade, caption chip, thin dark frame. */
function drawPhotoPanel(mainCtx, photo, rect, crop, grade, caption, scratch) {
  scratch.width = Math.max(2, rect.w);
  scratch.height = Math.max(2, rect.h);
  const sctx = scratch.getContext('2d');
  sctx.fillStyle = '#241028';
  sctx.fillRect(0, 0, scratch.width, scratch.height);
  if (photo) {
    drawPhotoInto(sctx, photo, { x: 0, y: 0, w: scratch.width, h: scratch.height }, crop);
    gradePanelCanvas(scratch, grade);
  } else {
    sctx.fillStyle = '#3a1a4a';
    sctx.font = `bold ${Math.round(scratch.height * 0.06)}px Anton, sans-serif`;
    sctx.textAlign = 'center';
    sctx.fillStyle = '#ffd21f';
    sctx.fillText('ADD PHOTO', scratch.width / 2, scratch.height / 2);
  }
  mainCtx.drawImage(scratch, rect.x, rect.y);
  mainCtx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
  mainCtx.lineWidth = Math.max(1, rect.w * 0.004);
  mainCtx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  if (caption) drawPanelCaption(mainCtx, rect, caption.line1, caption.line2);
}

/** The full-width title band: dark ground, halftone dots, gold top rule. */
function drawTitleBand(ctx, W, H) {
  const y = H * BAND_TOP;
  const band = ctx.createLinearGradient(0, y, 0, H);
  band.addColorStop(0, '#1c0a2e');
  band.addColorStop(0.5, '#160818');
  band.addColorStop(1, '#0d0518');
  ctx.fillStyle = band;
  ctx.fillRect(0, y, W, H - y);
  drawHalftoneBand(ctx, { x: 0, y, w: W, h: H - y }, Math.max(9, W / 160), 0.16);
  ctx.fillStyle = '#ffd21f';
  ctx.fillRect(0, y, W, Math.max(2, H * 0.004));
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(0, y + Math.max(2, H * 0.004), W, Math.max(1, H * 0.002));
}

/**
 * Draw the cover. `state` carries the layout, grade, photos by panel id,
 * per-panel crops and captions, and every editable line of lettering.
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  const gutter = Math.max(2, Math.round(W * GUTTER_FRAC));
  ctx.fillStyle = '#0d0518';
  ctx.fillRect(0, 0, W, H);
  const scratch = drawCover.scratch ?? (drawCover.scratch = document.createElement('canvas'));

  // Press-quote strip across the very top, VOL. 1 ticket at its right end.
  const stripH = H * 0.048;
  ctx.fillStyle = '#160818';
  ctx.fillRect(0, 0, W, stripH);
  const ticketW = W * 0.075;
  drawPressQuoteStrip(
    ctx, { x: 0, y: 0, w: W - ticketW - W * 0.015, h: stripH },
    state.quote, state.quoteSource,
  );
  drawVolumeTicket(
    ctx,
    { x: W - ticketW - W * 0.008, y: stripH * 0.16, w: ticketW, h: stripH * 0.68 },
    state.volume,
  );

  for (const panel of state.layout) {
    const rect = panelRect(panel, W, H, gutter);
    const caption = state.captions[panel.id] ?? {
      line1: panel.caption?.[0] ?? '', line2: panel.caption?.[1] ?? '',
    };
    drawPhotoPanel(
      ctx, state.photos[panel.id] ?? null, rect, state.crops[panel.id],
      state.grade, caption, scratch,
    );
  }

  drawTitleBand(ctx, W, H);

  // The title is the single dominant element: striped, stretched to span
  // the band, with the script subtitle overlapping its lower edge.
  const titleSize = drawStripedBlockTitle(
    ctx, state.title, W / 2, H * 0.885, W * 0.94, H * 0.2,
  );
  drawScriptSubtitle(
    ctx, state.subtitle, W * 0.66, H * 0.905, Math.max(titleSize * 0.27, H * 0.038),
  );

  // Tagline bar centred under the title, then the billing block.
  const barW = Math.min(W * 0.62, W * 0.62);
  drawTaglineBar(
    ctx, { x: (W - barW) / 2, y: H * 0.922, w: barW, h: H * 0.034 }, state.tagline,
  );
  drawBillingBlock(ctx, W * 0.44, H * 0.966, W * 0.56, H * 0.0135, state.billing);

  // Bottom row: COMING SOON left, barcode and gold seal right.
  ctx.save();
  ctx.fillStyle = '#ffd21f';
  ctx.font = `bold ${H * 0.016}px Anton, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.comingSoon.trim().toUpperCase(), W * 0.02, H * 0.978);
  ctx.restore();
  if (state.showSeal) {
    drawBarcode(
      ctx,
      { x: W * 0.855, y: H * 0.958, w: W * 0.055, h: H * 0.038 },
      '0 02113 12820',
    );
    drawGoldSeal(ctx, W * 0.955, H * 0.974, H * 0.036, state.sealLine1, state.sealLine2);
  }
}
