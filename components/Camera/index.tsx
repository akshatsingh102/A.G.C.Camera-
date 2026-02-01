'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CameraView } from './CameraView';
import { ModeSlider } from './ModeSlider';
import { CameraControls } from './CameraControls';
import { useCameraStore } from '@/lib/store';
import { processCapturedImage, processCanvasToBlob, createThumbnail, createVideoThumbnail } from '@/lib/canvas-utils';
import { RESOLUTIONS } from '@/lib/constants';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';
import { Gallery } from '../Gallery';
import { Settings } from '../Settings';
import clsx from 'clsx';

export function Camera() {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [zoom, setZoom] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { mode, settings, addToGallery } = useCameraStore();
  const isVideoMode = mode === 'video' || mode === 'slo-mo';
  const resolution = RESOLUTIONS[settings.resolution];

  const handleCapture = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if ((!video || !video.videoWidth) && !canvas) return;
    if (capturing) return;

    setCapturing(true);
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    const runCapture = async () => {
      await new Promise((r) => setTimeout(r, settings.timer * 1000));

      try {
        let blob: Blob;
        if (mode === 'portrait' && canvas && canvas.width > 0) {
          blob = await processCanvasToBlob(canvas, settings.filter, settings.aiEnhance);
        } else if (video?.videoWidth) {
          const w = Math.min(video.videoWidth, resolution.width);
          const h = Math.min(video.videoHeight, resolution.height);
          blob = await processCapturedImage(
            video,
            settings.filter,
            settings.aiEnhance,
            w,
            h
          );
        } else return;

        const url = URL.createObjectURL(blob);
        const thumbnail = await createThumbnail(blob);
        addToGallery({
          id: crypto.randomUUID(),
          type: 'photo',
          url,
          thumbnail,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error('Capture failed:', err);
      } finally {
        setCapturing(false);
      }
    };

    runCapture();
  }, [mode, settings.timer, settings.filter, settings.aiEnhance, resolution, addToGallery, capturing]);

  const handleStartRecord = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.srcObject) return;

    const stream = video.srcObject as MediaStream;
    const options = { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 2500000 };
    const recorder = new MediaRecorder(stream, options);

    chunksRef.current = [];
    recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      let thumbnail: string | undefined;
      try {
        thumbnail = await createVideoThumbnail(url);
      } catch {
        /* ignore */
      }
      addToGallery({
        id: crypto.randomUUID(),
        type: 'video',
        url,
        thumbnail,
        timestamp: Date.now(),
      });
      mediaRecorderRef.current = null;
    };

    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  }, [addToGallery]);

  const handleStopRecord = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const { listening, startListening, stopListening } = useVoiceCommand(
    handleCapture,
    !showGallery && !showSettings
  );

  const handleVoiceToggle = useCallback(() => {
    if (listening) stopListening();
    else startListening();
  }, [listening, startListening, stopListening]);

  const handleRefsReady = useCallback((video: HTMLVideoElement | null, canvas: HTMLCanvasElement | null) => {
    videoRef.current = video;
    canvasRef.current = canvas;
  }, []);

  return (
    <div className="camera-container bg-black">
      <div className={clsx('absolute inset-0', settings.grid && 'camera-grid')} />
      <CameraView
        zoom={zoom}
        facingMode={facingMode}
        onRefsReady={handleRefsReady}
      />
      {shutterFlash && (
        <div
          className="absolute inset-0 bg-white pointer-events-none shutter-flash z-50"
          style={{ animation: 'shutter-flash 0.2s ease-out' }}
        />
      )}
      <ModeSlider />
      <CameraControls
        onCapture={handleCapture}
        onFlip={() => setFacingMode((f) => (f === 'user' ? 'environment' : 'user'))}
        zoom={zoom}
        onZoomChange={setZoom}
        isRecording={isRecording}
        onStartRecord={handleStartRecord}
        onStopRecord={handleStopRecord}
        onVoiceToggle={handleVoiceToggle}
        voiceActive={listening}
      />
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        {(settings.upperButtons?.gallery ?? true) && (
          <button
            onClick={() => setShowGallery(true)}
            className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/30 bg-black/30 flex items-center justify-center"
          >
            <LastPhotoThumbnail />
          </button>
        )}
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full bg-black/30 hover:bg-black/50"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
      <div className="absolute top-4 right-4 z-20">
        <SceneIndicator mode={mode} />
      </div>

      <AnimatePresence>
        {showGallery && (
          <Gallery onClose={() => setShowGallery(false)} />
        )}
        {showSettings && (
          <Settings onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function LastPhotoThumbnail() {
  const gallery = useCameraStore((s) => s.gallery);
  const lastPhoto = gallery.find((g) => g.type === 'photo');
  if (!lastPhoto?.thumbnail) {
    return (
      <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  return <img src={lastPhoto.thumbnail} alt="Last" className="w-full h-full object-cover" />;
}

function SceneIndicator({ mode }: { mode: string }) {
  const labels: Record<string, string> = {
    night: '🌙 Night',
    portrait: '👤 Portrait',
    ultra: '✨ 108MP',
    'slo-mo': '🐢 Slo-Mo',
    panorama: '🖼️ Pano',
  };
  const label = labels[mode];
  if (!label) return null;
  return (
    <div className="px-3 py-1.5 rounded-full bg-black/50 text-white/90 text-xs">
      {label}
    </div>
  );
}
