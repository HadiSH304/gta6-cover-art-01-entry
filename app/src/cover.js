// Renders the whole cover onto a canvas at the canvas's own size: photo
// panels with the shared grade, the designed title panel, the starburst
// badge and the tagline strip. The same function draws the live preview and
// the exported PNG, so the screenshots show exactly what the app exports.

import { panelRect } from './panels.js';
import { gradePanelCanvas } from './grade.js';
import {
  drawBlockTitle,
  drawScriptSubtitle,
  drawTitlePanelBackdrop,
  drawBadge,
  drawTaglineStrip,
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

/** Paint one photo panel: photo, grade, then a thin dark frame. */
function drawPhotoPanel(mainCtx, photo, rect, crop, grade, scratch) {
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
}

/** Title + subtitle + tagline inside a title panel rect. */
function drawTitleInside(ctx, rect, state) {
  const pad = rect.w * 0.04;
  const stripH = rect.h * 0.17;
  const textH = rect.h - stripH;
  const titleSize = drawBlockTitle(
    ctx, state.title, rect.x + rect.w / 2,
    rect.y + textH * 0.52, rect.w - pad * 2, textH * 0.4,
  );
  drawScriptSubtitle(
    ctx, state.subtitle, rect.x + rect.w / 2,
    rect.y + textH * 0.52 + titleSize * 0.42, titleSize * 0.42,
  );
  drawTaglineStrip(ctx, { x: rect.x, y: rect.y + rect.h - stripH, w: rect.w, h: stripH }, state.tagline);
}

/**
 * Draw the cover. `state` carries the layout, grade, photos by panel id,
 * per-panel crops, and every editable line of lettering.
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  const gutter = Math.max(2, Math.round(W * GUTTER_FRAC));
  ctx.fillStyle = '#0d0518';
  ctx.fillRect(0, 0, W, H);
  const scratch = drawCover.scratch ?? (drawCover.scratch = document.createElement('canvas'));

  let titleRect = null;
  for (const panel of state.layout) {
    const rect = panelRect(panel, W, H, gutter);
    if (panel.title) {
      titleRect = rect;
      continue;
    }
    drawPhotoPanel(ctx, state.photos[panel.id] ?? null, rect, state.crops[panel.id], state.grade, scratch);
  }

  if (titleRect) {
    drawTitlePanelBackdrop(ctx, titleRect);
    ctx.strokeStyle = '#ff2e88';
    ctx.lineWidth = Math.max(2, W * 0.002);
    ctx.strokeRect(titleRect.x, titleRect.y, titleRect.w, titleRect.h);
    drawTitleInside(ctx, titleRect, state);
  }

  if (state.showBadge) {
    const r = Math.max(26, W * 0.042);
    drawBadge(ctx, r * 1.15, r * 1.15, r, state.badgeLine1, state.badgeLine2);
  }

  // A diagonal neon slash across the gutter keeps the collage poster-like.
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 46, 136, 0.9)';
  ctx.lineWidth = Math.max(2, W * 0.003);
  ctx.beginPath();
  ctx.moveTo(W * 0.385, 0);
  ctx.lineTo(W * 0.385, H * 0.575);
  ctx.stroke();
  ctx.restore();
}
