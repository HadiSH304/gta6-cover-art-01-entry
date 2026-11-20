// Panel layouts for the cover. Every rect is a fraction of the cover's own
// width/height, so one layout draws at 1920x1080, 1080x1080 and 1080x1350
// alike. The default layout is the asymmetric GTA-poster collage: one hero
// panel, a stacked middle column, a tall right panel, two small strips and a
// designed title panel. A uniform grid exists only as an option.

/** The asymmetric collage: hero + stacks + strips + title panel. */
export const COLLAGE = [
  { id: 'hero', label: 'Hero', x: 0, y: 0, w: 0.385, h: 0.575, sample: 'portrait' },
  { id: 'palms', label: 'Palms', x: 0.391, y: 0, w: 0.255, h: 0.282, sample: 'palms' },
  { id: 'skyline', label: 'Skyline', x: 0.391, y: 0.288, w: 0.255, h: 0.287, sample: 'skyline' },
  { id: 'driver', label: 'Driver', x: 0.652, y: 0, w: 0.348, h: 0.575, sample: 'driver' },
  { id: 'pier', label: 'Pier', x: 0, y: 0.581, w: 0.19, h: 0.419, sample: 'pier' },
  { id: 'beach', label: 'Beach', x: 0.196, y: 0.581, w: 0.189, h: 0.419, sample: 'boulevard' },
  // The title panel is not a photo panel: the renderer draws a sunset
  // backdrop with palm silhouettes and the two-layer title inside it.
  { id: 'title', label: 'Title panel', x: 0.391, y: 0.581, w: 0.609, h: 0.419, title: true },
];

/** The uniform grid option: six even photo panels over a title strip. */
export const GRID = [
  { id: 'hero', label: 'Hero', x: 0, y: 0, w: 0.328, h: 0.36, sample: 'portrait' },
  { id: 'palms', label: 'Palms', x: 0.336, y: 0, w: 0.328, h: 0.36, sample: 'palms' },
  { id: 'driver', label: 'Driver', x: 0.672, y: 0, w: 0.328, h: 0.36, sample: 'driver' },
  { id: 'skyline', label: 'Skyline', x: 0, y: 0.368, w: 0.328, h: 0.36, sample: 'skyline' },
  { id: 'pier', label: 'Pier', x: 0.336, y: 0.368, w: 0.328, h: 0.36, sample: 'pier' },
  { id: 'beach', label: 'Beach', x: 0.672, y: 0.368, w: 0.328, h: 0.36, sample: 'boulevard' },
  { id: 'title', label: 'Title strip', x: 0, y: 0.736, w: 1, h: 0.264, title: true },
];

export const LAYOUTS = { collage: COLLAGE, grid: GRID };

/** Pixel rect of a fractional panel on a canvas of the given size. */
export function panelRect(panel, width, height, gutter) {
  return {
    x: Math.round(panel.x * width + gutter),
    y: Math.round(panel.y * height + gutter),
    w: Math.round(panel.w * width - gutter * 2),
    h: Math.round(panel.h * height - gutter * 2),
  };
}
