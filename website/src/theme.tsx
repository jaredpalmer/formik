const palx = require('palx');

export const BASE_COLOR = '#666ee8';
export const SIDEBAR_WIDTH = 240;

export interface ColorWay {
  base: string;
  black: string;
  gray: string[];
  indigo: string[];
  violet: string[];
  fuschia: string[];
  pink: string[];
  red: string[];
  orange: string[];
  yellow: string[];
  lime: string[];
  green: string[];
  teal: string[];
  cyan: string[];
  blue: string[];
}

export const COLORS: ColorWay = palx(BASE_COLOR);

export enum INTENT {
  NONE,
  PRIMARY,
}

export const FONTS = {
  sans:
    'system-ui, "San Francisco; -apple-system, BlinkMacSystemFont, ".SFNSText-Regular", "Helvetica Neue", Helvetica, sans-serif',
  monospace:
    '"SFMono-Regular", "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace',
};

export const TYPE_SCALE = [72, 64, 48, 32, 24, 20, 16, 14, 12];

const SIZES = {
  xsmall: { min: 0, max: 699 },
  small: { min: 700, max: 779 },
  medium: { min: 780, max: 979 },
  large: { min: 980, max: 1279 },
  xlarge: { min: 1280, max: 1339 },
  xxlarge: { min: 1340, max: Infinity },

  // Sidebar/nav related tweakpoints
  largerSidebar: { min: 1100, max: 1339 },
  sidebarFixed: { min: 2000, max: Infinity },
};

type Size = keyof typeof SIZES;

export const media = {
  between(
    smallKey: Size,
    largeKey: Size,
    excludeLarge: boolean = false,
    trim: boolean = false
  ) {
    let result: string;
    if (excludeLarge) {
      result = `@media (min-width: ${
        SIZES[smallKey].min
      }px) and (max-width: ${SIZES[largeKey].min - 1}px)`;
    } else {
      if (SIZES[largeKey].max === Infinity) {
        result = `@media (min-width: ${SIZES[smallKey].min}px)`;
      } else {
        result = `@media (min-width: ${
          SIZES[smallKey].min
        }px) and (max-width: ${SIZES[largeKey].max}px)`;
      }
    }

    if (trim) {
      return result.replace('@media ', '');
    }

    return result;
  },

  greaterThan(key: Size, trim: boolean = false) {
    let result = `@media (min-width: ${SIZES[key].min}px)`;

    if (trim) {
      return result.replace('@media ', '');
    }

    return result;
  },

  lessThan(key: Size, trim: boolean = false) {
    let result = `@media (max-width: ${SIZES[key].min - 1}px)`;
    if (trim) {
      return result.replace('@media ', '');
    }
    return result;
  },

  size(key: Size, trim: boolean = false) {
    const size = SIZES[key];

    if (size.min == null) {
      return media.lessThan(key, trim);
    } else if (size.max == null) {
      return media.greaterThan(key, trim);
    } else {
      return media.between(key, key, false, trim);
    }
  },
};

export const SPACE = [0, 4, 8, 16, 32, 64];
