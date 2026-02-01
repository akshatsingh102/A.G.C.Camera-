'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useFaceDetection(enabled: boolean) {
  const [faces, setFaces] = useState<FaceBox[]>([]);
  const [ready, setReady] = useState(false);
  const detectorRef = useRef<any>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function init() {
      try {
        const faceDetection = await import('@tensorflow-models/face-detection');
        const tf = await import('@tensorflow/tfjs-core');
        await import('@tensorflow/tfjs-backend-webgl');
        await tf.ready();

        const detector = await faceDetection.createDetector(
          faceDetection.SupportedModels.MediaPipeFaceDetector,
          {
            runtime: 'mediapipe',
            model: 'short',
            maxFaces: 5,
          } as any
        );

        if (!cancelled) {
          detectorRef.current = detector;
          setReady(true);
        }
      } catch (err) {
        console.warn('Face detection init failed:', err);
        if (!cancelled) setReady(false);
      }
    }

    init();
    return () => {
      cancelled = true;
      detectorRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  const detectFaces = useCallback(
    async (video: HTMLVideoElement): Promise<FaceBox[]> => {
      const detector = detectorRef.current;
      if (!detector || !ready || !video.videoWidth) return [];

      try {
        const predictions = await detector.estimateFaces(video, {
          flipHorizontal: false,
        });

        const boxes: FaceBox[] = predictions.map((p: any) => {
          const box = p.box;
          return {
            x: box.xMin,
            y: box.yMin,
            width: box.width,
            height: box.height,
          };
        });

        setFaces(boxes);
        return boxes;
      } catch {
        return [];
      }
    },
    [ready]
  );

  const startDetectionLoop = useCallback(
    (video: HTMLVideoElement, callback?: (faces: FaceBox[]) => void) => {
      if (!enabled || !ready) return;

      const run = async () => {
        const detected = await detectFaces(video);
        callback?.(detected);
        rafRef.current = requestAnimationFrame(() => run());
      };
      run();
    },
    [enabled, ready, detectFaces]
  );

  const stopDetectionLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
  }, []);

  return {
    faces,
    ready,
    detectFaces,
    startDetectionLoop,
    stopDetectionLoop,
  };
}
