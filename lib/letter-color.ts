// Maps the first alphabetic character of a name to a distinct hue so every
// letter renders a different avatar color. Lightness + chroma are held at
// values close to primary-500 (see app/globals.css) so every letter stays in
// the same tonal family as the brand.
const L = 0.62;
const C = 0.13;
const BRAND_HUE = 242;

export type LetterColor = {
  background: string;
  foreground: string;
};

export function letterColor(name: string): LetterColor {
  const bucket = bucketFor(name);
  const hue = (BRAND_HUE + bucket * (360 / 26)) % 360;
  return {
    background: `oklch(${L} ${C} ${hue.toFixed(2)})`,
    foreground: "oklch(0.985 0 0)",
  };
}

function bucketFor(name: string): number {
  for (const c of name) {
    const up = c.toUpperCase();
    if (up >= "A" && up <= "Z") return up.charCodeAt(0) - 65;
  }
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h) % 26;
}
