// Panel layouts for the cover, v2. Every rect is a fraction of the cover's
// own width/height, so one layout draws at 1920x1080, 1080x1080 and
// 1080x1350 alike. The photo grid fills the top of the cover; a full-width
// title band (drawn by cover.js, not a panel) takes the bottom ~28%, so
// every panel is a photo — no slot is spent on a title panel. Each panel
// carries its own on-cover caption (a role, or a place + time + tagline),
// and a default crop that keeps its subject in frame.

/** The default layout: one tall hero, two rows of three, seven photos. */
export const COLLAGE = [
  { id: 'hero', label: 'Hero', x: 0, y: 0.048, w: 0.3, h: 0.672, sample: 'portrait',
    caption: ['THE DRIVER', 'ONE LAST SUMMER'], crop: { zoom: 1, ox: -0.05, oy: 0 } },
  { id: 'palms', label: 'Palms', x: 0.306, y: 0.048, w: 0.224, h: 0.323, sample: 'palms',
    caption: ['OCEAN DRIVE', '6:42 PM — LOOKING FOR TROUBLE'], crop: { zoom: 1, ox: 0, oy: 0 } },
  { id: 'driver', label: 'Driver', x: 0.536, y: 0.048, w: 0.224, h: 0.323, sample: 'driver',
    caption: ['THE BOSS', 'MONEY TALKS'], crop: { zoom: 1, ox: 0, oy: 0 } },
  { id: 'skyline', label: 'Skyline', x: 0.766, y: 0.048, w: 0.234, h: 0.323, sample: 'skyline',
    caption: ['VICE CITY', '7:15 PM — LIGHTS OUT'], crop: { zoom: 1, ox: 0, oy: 0 } },
  { id: 'pier', label: 'Pier', x: 0.306, y: 0.377, w: 0.224, h: 0.343, sample: 'pier',
    caption: ['THE ANGLER', 'CATCH OF THE DAY'], crop: { zoom: 1, ox: 0, oy: 0 } },
  { id: 'boulevard', label: 'Boulevard', x: 0.536, y: 0.377, w: 0.224, h: 0.343, sample: 'boulevard',
    caption: ['THE INSIDER', 'NO WITNESSES'], crop: { zoom: 1, ox: 0, oy: 0 } },
  // The same man as Driver, tight on his face: the cast recurs across panels.
  { id: 'driverClose', label: 'Driver close-up', x: 0.766, y: 0.377, w: 0.234, h: 0.343, sample: 'driver',
    caption: ['OCEAN DRIVE', '9:15 PM — LIGHTS OUT'], crop: { zoom: 2, ox: -0.5, oy: 0.27 } },
];

/** The uniform grid option: six even photo panels over the title band. */
export const GRID = [
  { id: 'hero', label: 'Hero', x: 0, y: 0.048, w: 0.326, h: 0.323, sample: 'portrait',
    caption: ['THE DRIVER', 'ONE LAST SUMMER'], crop: { zoom: 1, ox: -0.05, oy: 0 } },
  { id: 'palms', label: 'Palms', x: 0.337, y: 0.048, w: 0.326, h: 0.323, sample: 'palms',
    caption: ['OCEAN DRIVE', '6:42 PM — LOOKING FOR TROUBLE'], crop: { zoom: 1, ox: 0, oy: 0 } },
  { id: 'driver', label: 'Driver', x: 0.674, y: 0.048, w: 0.326, h: 0.323, sample: 'driver',
    caption: ['THE BOSS', 'MONEY TALKS'], crop: { zoom: 1, ox: 0, oy: 0 } },
  { id: 'skyline', label: 'Skyline', x: 0, y: 0.377, w: 0.326, h: 0.343, sample: 'skyline',
    caption: ['VICE CITY', '7:15 PM — LIGHTS OUT'], crop: { zoom: 1, ox: 0, oy: 0 } },
  { id: 'pier', label: 'Pier', x: 0.337, y: 0.377, w: 0.326, h: 0.343, sample: 'pier',
    caption: ['THE ANGLER', 'CATCH OF THE DAY'], crop: { zoom: 1, ox: 0, oy: 0 } },
  { id: 'boulevard', label: 'Boulevard', x: 0.674, y: 0.377, w: 0.326, h: 0.343, sample: 'boulevard',
    caption: ['THE INSIDER', 'NO WITNESSES'], crop: { zoom: 1, ox: 0, oy: 0 } },
];

export const LAYOUTS = { collage: COLLAGE, grid: GRID };

/** The title band's top edge, as a fraction of cover height. */
export const BAND_TOP = 0.72;

/** Pixel rect of a fractional panel on a canvas of the given size. */
export function panelRect(panel, width, height, gutter) {
  return {
    x: Math.round(panel.x * width + gutter),
    y: Math.round(panel.y * height + gutter),
    w: Math.round(panel.w * width - gutter * 2),
    h: Math.round(panel.h * height - gutter * 2),
  };
}
