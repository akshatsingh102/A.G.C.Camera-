import type { FilterType } from './types';
import { applyFilterToImageData, autoEnhance } from './filters';

export async function processCapturedImage(
  video: HTMLVideoElement,
  filter: FilterType,
  enhance: boolean,
  width: number,
  height: number
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(video, 0, 0, width, height);

  if (filter !== 'none' || enhance) {
    const imageData = ctx.getImageData(0, 0, width, height);
    if (enhance) {
      autoEnhance(imageData);
    }
    if (filter !== 'none') {
      applyFilterToImageData(imageData, filter);
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob || new Blob()),
      'image/jpeg',
      0.92
    );
  });
}

export async function processCanvasToBlob(
  canvas: HTMLCanvasElement,
  filter: string,
  enhance: boolean
): Promise<Blob> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Blob();

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.drawImage(canvas, 0, 0);

  let imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
  if (enhance) {
    const { autoEnhance } = await import('./filters');
    autoEnhance(imageData);
  }
  if (filter !== 'none') {
    const { applyFilterToImageData } = await import('./filters');
    applyFilterToImageData(imageData, filter as any);
  }
  tempCtx.putImageData(imageData, 0, 0);

  return new Promise((resolve) => {
    tempCanvas.toBlob((blob) => resolve(blob || new Blob()), 'image/jpeg', 0.92);
  });
}

export function createThumbnail(blob: Blob, size = 100): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(size / img.width, size / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

/** Save blob to device (Downloads folder on desktop, device gallery/downloads on mobile) */
export function saveBlobToDevice(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function createVideoThumbnail(videoUrl: string, size = 100): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.currentTime = 0.5;
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = (video.videoHeight / video.videoWidth) * size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
      URL.revokeObjectURL(video.src);
    };
    video.onerror = reject;
    video.src = videoUrl;
  });
}
