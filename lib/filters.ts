import type { FilterType } from './types';

export function applyFilter(
  ctx: CanvasRenderingContext2D,
  filter: FilterType
): void {
  switch (filter) {
    case 'vintage':
      ctx.filter = 'sepia(0.5) contrast(1.1) brightness(0.95) saturate(0.8)';
      break;
    case 'cinematic':
      ctx.filter = 'contrast(1.2) saturate(0.9) brightness(0.95)';
      break;
    case 'bw':
      ctx.filter = 'grayscale(1) contrast(1.1)';
      break;
    case 'warm':
      ctx.filter = 'sepia(0.3) saturate(1.2) brightness(1.05)';
      break;
    case 'cool':
      ctx.filter = 'hue-rotate(-10deg) saturate(1.1) brightness(1.02)';
      break;
    default:
      ctx.filter = 'none';
  }
}

export function applyFilterToImageData(
  imageData: ImageData,
  filter: FilterType
): ImageData {
  const { data } = imageData;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    switch (filter) {
      case 'vintage':
        [r, g, b] = applyVintage(r, g, b);
        break;
      case 'cinematic':
        [r, g, b] = applyCinematic(r, g, b);
        break;
      case 'bw':
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = g = b = Math.min(255, gray * 1.1);
        break;
      case 'warm':
        [r, g, b] = applyWarm(r, g, b);
        break;
      case 'cool':
        [r, g, b] = applyCool(r, g, b);
        break;
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  return imageData;
}

function applyVintage(r: number, g: number, b: number): [number, number, number] {
  const tr = 0.393 * r + 0.769 * g + 0.189 * b;
  const tg = 0.349 * r + 0.686 * g + 0.168 * b;
  const tb = 0.272 * r + 0.534 * g + 0.131 * b;
  return [
    Math.min(255, tr * 0.95),
    Math.min(255, tg * 0.95),
    Math.min(255, tb * 0.95),
  ];
}

function applyCinematic(r: number, g: number, b: number): [number, number, number] {
  const contrast = 1.2;
  const brightness = 0.95;
  r = (r - 128) * contrast + 128 + (brightness - 1) * 128;
  g = (g - 128) * contrast + 128 + (brightness - 1) * 128;
  b = (b - 128) * contrast + 128 + (brightness - 1) * 128;
  return [
    Math.max(0, Math.min(255, r)),
    Math.max(0, Math.min(255, g)),
    Math.max(0, Math.min(255, b)),
  ];
}

function applyWarm(r: number, g: number, b: number): [number, number, number] {
  r = Math.min(255, r * 1.05);
  g = Math.min(255, g * 1.02);
  b = Math.min(255, b * 0.95);
  return [r, g, b];
}

function applyCool(r: number, g: number, b: number): [number, number, number] {
  r = Math.min(255, r * 0.95);
  g = Math.min(255, g * 1.02);
  b = Math.min(255, b * 1.08);
  return [r, g, b];
}

export function autoEnhance(imageData: ImageData): ImageData {
  const { data } = imageData;
  const len = data.length;
  let rSum = 0, gSum = 0, bSum = 0;
  const pixelCount = len / 4;

  for (let i = 0; i < len; i += 4) {
    rSum += data[i];
    gSum += data[i + 1];
    bSum += data[i + 2];
  }

  const rAvg = rSum / pixelCount;
  const gAvg = gSum / pixelCount;
  const bAvg = bSum / pixelCount;
  const target = 128;
  const rGain = target / (rAvg || 1);
  const gGain = target / (gAvg || 1);
  const bGain = target / (bAvg || 1);
  const gain = Math.min(rGain, gGain, bGain, 1.5);

  for (let i = 0; i < len; i += 4) {
    data[i] = Math.min(255, data[i] * gain * 1.1);
    data[i + 1] = Math.min(255, data[i + 1] * gain * 1.1);
    data[i + 2] = Math.min(255, data[i + 2] * gain * 1.1);
  }

  return imageData;
}
