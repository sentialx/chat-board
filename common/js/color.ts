// https://stackoverflow.com/a/13542669
export const getColorBrightness = (color: string): number => {
  if (color.startsWith("rgba(255, 255, 255")) return 255;
  if (color.startsWith("rgba(0, 0, 0")) return 0;

  let r: number;
  let g;
  let b;

  if (color.match(/^rgb/)) {
    const match = color.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/,
    );

    if (!match) return 0;

    r = parseInt(match[1]);
    g = parseInt(match[2]);
    b = parseInt(match[3]);
  } else {
    const num = +`0x${color
      .slice(1)
      .replace((color.length < 5 && /./g) as any, "$&$&")}`;

    r = num >> 16;
    g = (num >> 8) & 255;
    b = num & 255;
  }

  return Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
};

// https://stackoverflow.com/a/37600815
// changeColorLightness(0x00FF00, 0x50);
// changeColorLightness(parseInt("#00FF00".replace('#',''), 16), 0x50);
// changeColorLightness(0x00FF00, 127.5);
// export function changeColorLightness(color: number, lightness: number): number {
//   const r = (color & 0xff0000) / 0x10 ** 4;
//   const g = (color & 0x00ff00) / 0x10 ** 2;
//   const b = color & 0x0000ff;

//   const changedR = Math.max(0, Math.min(r + lightness, 0xff));
//   const changedG = Math.max(0, Math.min(g + lightness, 0xff));
//   const changedB = Math.max(0, Math.min(b + lightness, 0xff));

//   return changedR * 0x10 ** 4 + changedG * 0x10 ** 2 + changedB;
// }

// https://natclark.com/tutorials/javascript-lighten-darken-hex-color/
// const newShade = (hexColor: string, magnitude: number): string => {
//   hexColor = hexColor.replace(`#`, ``);
//   if (hexColor.length === 6) {
//     const decimalColor = parseInt(hexColor, 16);
//     let r = (decimalColor >> 16) + magnitude;
//     r > 255 && (r = 255);
//     r < 0 && (r = 0);
//     let g = (decimalColor & 0x0000ff) + magnitude;
//     g > 255 && (g = 255);
//     g < 0 && (g = 0);
//     let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
//     b > 255 && (b = 255);
//     b < 0 && (b = 0);
//     return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
//   } else {
//     return hexColor;
//   }
// };

// https://css-tricks.com/snippets/javascript/lighten-darken-color/
// function adjustBrightness(col: string, amt: number): string {
//   const num = parseInt(col.charAt(0) === "#" ? col.slice(1) : col, 16);

//   const clamp = (val: number): number => (val < 0 ? 0 : val > 255 ? 255 : val);

//   return (
//     (col.charAt(0) === "#" ? "#" : "") +
//     [0, 8, 16]
//       .map((shift) => clamp(((num >> shift) & 0xff) + amt) << shift)
//       .reduce((a, c) => a + c, 0)
//       .toString(16)
//       .padStart(6, "0")
//   );
// }

const rgbToHsl = (
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } => {
  r = r / 255;
  g = g / 255;
  b = b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = (max + min) / 2;
  let s = (max + min) / 2;
  let l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  return { h, s, l };
};

const hslToRgb = (
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } => {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  let r = 0;
  let g = 0;
  let b = 0;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

// https://github.com/bgrins/TinyColor/blob/master/tinycolor.js
// https://github.com/scttcper/tinycolor/blob/master/src/conversion.ts

export class Color {
  public readonly r: number;
  public readonly g: number;
  public readonly b: number;
  public readonly a: number;

  constructor({ r, g, b, a }: { r: number; g: number; b: number; a: number }) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public static fromHex(hex: string): Color {
    const hexWithoutHash = hex.replace("#", "");
    const r = parseInt(hexWithoutHash.substring(0, 2), 16);
    const g = parseInt(hexWithoutHash.substring(2, 4), 16);
    const b = parseInt(hexWithoutHash.substring(4, 6), 16);
    return new Color({ r, g, b, a: 1 });
  }

  public static fromRgb(rgb: string): Color {
    const [r, g, b] = rgb
      .replace("rgb(", "")
      .replace(")", "")
      .split(",")
      .map((s) => parseInt(s, 10));
    return new Color({ r, g, b, a: 1 });
  }

  public static fromRgba(rgba: string): Color {
    const [r, g, b, a] = rgba
      .replace("rgba(", "")
      .replace(")", "")
      .split(",")
      .map((s) => parseFloat(s));
    return new Color({ r, g, b, a });
  }

  public static fromHsl(hsl: string): Color {
    const [h, s, l] = hsl
      .replace("hsl(", "")
      .replace(")", "")
      .split(",")
      .map((s) => parseInt(s, 10));
    const { r, g, b } = hslToRgb(h, s, l);
    return new Color({ r, g, b, a: 1 });
  }

  public setA(a: number): Color {
    return new Color({ r: this.r, g: this.g, b: this.b, a });
  }

  public setR(r: number): Color {
    return new Color({ r, g: this.g, b: this.b, a: this.a });
  }

  public setG(g: number): Color {
    return new Color({ r: this.r, g, b: this.b, a: this.a });
  }

  public setB(b: number): Color {
    return new Color({ r: this.r, g: this.g, b, a: this.a });
  }

  public get hex(): string {
    let hex = `#${this.r.toString(16)}${this.g.toString(16)}${this.b.toString(
      16,
    )}`;
    if (hex.length < 7) {
      hex = hex.padEnd(7, "0");
    }
    return hex;
  }

  public toString(): string {
    return this.rgb;
  }

  public get rgb(): string {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  public get rgba(): string {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }

  public get hsl(): string {
    const { h, s, l } = rgbToHsl(this.r, this.g, this.b);
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  public get brightness(): number {
    return getColorBrightness(this.rgb);
  }

  // "light" - for example black rectangle with white text
  public get contrast(): "light" | "dark" {
    return this.brightness > 128 ? "dark" : "light";
  }

  // public mix(color: Color, pct: number = 1): Color {
  //   const f = this;
  //   const t = color;
  //   const R = Math.round(f.r + (t.r - f.r) * pct);
  //   const G = Math.round(f.g + (t.g - f.g) * pct);
  //   const B = Math.round(f.b + (t.b - f.b) * pct);
  //   return new Color({ r: R, g: G, b: B, a: this.a });
  // }

  public darken(amount: number = 10): Color {
    const hsl = rgbToHsl(this.r, this.g, this.b);
    hsl.l -= amount / 100;
    hsl.l = Math.max(0, hsl.l);
    const { r, g, b } = hslToRgb(hsl.h, hsl.s, hsl.l);
    return new Color({ r, g, b, a: this.a });
  }

  public lighten(amount: number = 10): Color {
    const hsl = rgbToHsl(this.r, this.g, this.b);
    hsl.l += amount / 100;
    hsl.l = Math.min(100, hsl.l);
    const { r, g, b } = hslToRgb(hsl.h, hsl.s, hsl.l);
    return new Color({ r, g, b, a: this.a });
  }
}
