'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCameraStore } from '@/lib/store';
import { RESOLUTIONS } from '@/lib/constants';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { useSelfieSegmentation } from '@/hooks/useSelfieSegmentation';
import clsx from 'clsx';

interface CameraViewProps {
  onReady?: () => void;
  onFaceDetected?: (faces: { x: number; y: number; width: number; height: number }[]) => void;
  onRefsReady?: (video: HTMLVideoElement | null, canvas: HTMLCanvasElement | null) => void;
  zoom?: number;
  facingMode?: 'user' | 'environment';
}

export function CameraView({
  onReady,
  onFaceDetected,
  onRefsReady,
  zoom = 1,
  facingMode = 'environment',
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mode, settings } = useCameraStore();
  const isPortrait = mode === 'portrait';
  const resolution = RESOLUTIONS[settings.resolution];
  const width = Math.min(resolution.width, 1920);
  const height = Math.min(resolution.height, 1080);

  const { faces, ready: faceReady, startDetectionLoop, stopDetectionLoop } = useFaceDetection(
    settings.aiFaceDetection && !isPortrait
  );
  const { ready: segReady, sendFrame, applyPortraitBlur } = useSelfieSegmentation(isPortrait);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: mode === 'video' || mode === 'slo-mo',
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setReady(true);
      setError(null);
      onReady?.();
      onRefsReady?.(videoRef.current, canvasRef.current);
    } catch (err) {
      setError('Camera access denied or unavailable');
      setReady(false);
      console.error(err);
    }
  }, [facingMode, width, height, mode, onReady]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    stopDetectionLoop();
    setReady(false);
  }, [stopDetectionLoop]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ready || !settings.aiFaceDetection || isPortrait) return;
    startDetectionLoop(video, onFaceDetected);
    return () => stopDetectionLoop();
  }, [ready, settings.aiFaceDetection, isPortrait, startDetectionLoop, stopDetectionLoop, onFaceDetected]);

  const renderFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !ready || !video.videoWidth) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isPortrait && segReady) {
      if (!applyPortraitBlur(video, canvas, 10)) {
        ctx.drawImage(video, 0, 0, w, h);
      }
    } else {
      ctx.drawImage(video, 0, 0, w, h);
    }
  }, [ready, isPortrait, segReady, applyPortraitBlur]);

  useEffect(() => {
    if (!isPortrait || !segReady || !ready) return;
    const video = videoRef.current;
    if (!video) return;
    const interval = setInterval(() => sendFrame(video), 100);
    return () => clearInterval(interval);
  }, [isPortrait, segReady, ready, sendFrame]);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      renderFrame();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [renderFrame]);

  useEffect(() => {
    onFaceDetected?.(faces);
  }, [faces, onFaceDetected]);

  useEffect(() => {
    if (ready && videoRef.current && canvasRef.current) {
      onRefsReady?.(videoRef.current, canvasRef.current);
    }
  }, [ready, onRefsReady]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <div className="text-center p-6">
          <p className="text-red-400 text-lg mb-2">{error}</p>
          <p className="text-gray-500 text-sm">Please allow camera access and try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        className={clsx(
          'absolute inset-0 w-full h-full object-cover',
          facingMode === 'user' && 'scale-x-[-1]'
        )}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      />
      {settings.aiFaceDetection && faceReady && !isPortrait && faces.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {faces.map((face, i) => {
            const vw = videoRef.current?.videoWidth || 1;
            const vh = videoRef.current?.videoHeight || 1;
            return (
              <div
                key={i}
                className="absolute border-2 border-green-500 rounded-lg animate-pulse-slow"
                style={{
                  left: `${(face.x / vw) * 100}%`,
                  top: `${(face.y / vh) * 100}%`,
                  width: `${(face.width / vw) * 100}%`,
                  height: `${(face.height / vh) * 100}%`,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

