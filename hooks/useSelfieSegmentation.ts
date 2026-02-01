'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useSelfieSegmentation(enabled: boolean) {
  const [ready, setReady] = useState(false);
  const segmenterRef = useRef<any>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function init() {
      try {
        const { SelfieSegmentation } = await import(
          '@mediapipe/selfie_segmentation'
        );
        const segmenter = new SelfieSegmentation({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });
        segmenter.setOptions({
          modelSelection: 1,
          selfieMode: true,
        });
        segmenter.onResults((results: any) => {
          if (cancelled || !results.segmentationMask) return;
          const mask = results.segmentationMask;
          const canvas = document.createElement('canvas');
          canvas.width = mask.width;
          canvas.height = mask.height;
          const ctx = canvas.getContext('2d')!;
          const imgData = ctx.createImageData(mask.width, mask.height);
          const data = mask.data;
          for (let i = 0; i < data.length; i++) {
            const v = data[i] > 0.5 ? 255 : 0;
            imgData.data[i * 4] = v;
            imgData.data[i * 4 + 1] = v;
            imgData.data[i * 4 + 2] = v;
            imgData.data[i * 4 + 3] = 255;
          }
          ctx.putImageData(imgData, 0, 0);
          maskRef.current = canvas;
        });
        if (!cancelled) {
          segmenterRef.current = segmenter;
          setReady(true);
        }
      } catch (err) {
        console.warn('Selfie segmentation init failed:', err);
        if (!cancelled) setReady(false);
      }
    }

    init();
    return () => {
      cancelled = true;
      segmenterRef.current = null;
      maskRef.current = null;
    };
  }, [enabled]);

  const sendFrame = useCallback((video: HTMLVideoElement) => {
    if (segmenterRef.current && video.videoWidth) {
      segmenterRef.current.send({ image: video });
    }
  }, []);

  const applyPortraitBlur = useCallback(
    (
      video: HTMLVideoElement,
      outputCanvas: HTMLCanvasElement,
      blurAmount = 10
    ): boolean => {
      if (!ready || !video.videoWidth) return false;

      const width = video.videoWidth;
      const height = video.videoHeight;
      outputCanvas.width = width;
      outputCanvas.height = height;
      const ctx = outputCanvas.getContext('2d');
      if (!ctx) return false;

      const mask = maskRef.current;
      if (!mask || mask.width !== width || mask.height !== height) {
        ctx.drawImage(video, 0, 0, width, height);
        return false;
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d')!;

      tempCtx.filter = `blur(${blurAmount}px)`;
      tempCtx.drawImage(video, 0, 0, width, height);
      tempCtx.filter = 'none';

      ctx.drawImage(tempCanvas, 0, 0);

      const personCanvas = document.createElement('canvas');
      personCanvas.width = width;
      personCanvas.height = height;
      const personCtx = personCanvas.getContext('2d')!;
      personCtx.drawImage(video, 0, 0);
      const personData = personCtx.getImageData(0, 0, width, height);
      const maskData = mask.getContext('2d')!.getImageData(0, 0, width, height);
      for (let i = 0; i < personData.data.length; i += 4) {
        personData.data[i + 3] = maskData.data[i];
      }
      personCtx.putImageData(personData, 0, 0);

      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(personCanvas, 0, 0);

      return true;
    },
    [ready]
  );

  return { ready, sendFrame, applyPortraitBlur };
}
