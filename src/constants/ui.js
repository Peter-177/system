/**
 * UI Constants
 *
 * Single source of truth for magic numbers and strings used across components.
 * Import from this file instead of inlining raw values.
 */

/** Minimum touch target dimension required by WCAG 2.5.5 and iOS HIG (px). */
export const MIN_TOUCH_TARGET = 44;

/** Minimum input font size to prevent iOS Safari from auto-zooming on focus (px). */
export const IOS_SAFE_FONT_SIZE = 16;

/** Image crop output size (px, square). */
export const CROP_OUTPUT_SIZE = 512;

/** Standard animation durations (ms). */
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  PAGE: 800,
};

/** Named viewport widths for media-query documentation. Values match Tailwind breakpoints. */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

/** Application user roles as used in Firestore and permission checks. */
export const ROLES = {
  ADMIN: 'admin',
  SERVANT: 'servant',
};

/** Student year labels (used in filters, badges, and forms). */
export const STUDENT_YEARS = [
  'NU',
  'KG',
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
  '6th',
  'Prep 1',
  'Prep 2',
  'Prep 3',
  'Sec 1',
  'Sec 2',
  'Sec 3',
];

/** Professional blue palette used across avatars and accents. */
export const BLUE_SHADES = [
  '#0ea5e9',
  '#38bdf8',
  '#0056D2',
  '#0284C7',
  '#7dd3fc',
];
