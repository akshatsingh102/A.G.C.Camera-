'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Video,
  RotateCcw,
  Grid3X3,
  Zap,
  ZapOff,
  Timer,
  Mic,
  MicOff,
} from 'lucide-react';
import { useCameraStore } from '@/lib/store';
import clsx from 'clsx';

interface CameraControlsProps {
  onCapture: () => void;
  onFlip: () => void;
  zoom: number;
  onZoomChange: (z: number) => void;
  isRecording: boolean;
  onStartRecord: () => void;
  onStopRecord: () => void;
  onVoiceToggle?: () => void;
  voiceActive?: boolean;
}

export function CameraControls({
  onCapture,
  onFlip,
  zoom,
  onZoomChange,
  isRecording,
  onStartRecord,
  onStopRecord,
  onVoiceToggle,
  voiceActive = false,
}: CameraControlsProps) {
  const { mode, settings, updateSettings } = useCameraStore();
  const [showTimer, setShowTimer] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  const isVideoMode = mode === 'video' || mode === 'slo-mo';

  const cycleFlash = useCallback(() => {
    const next: Record<string, 'off' | 'on' | 'auto'> = {
      off: 'on',
      on: 'auto',
      auto: 'off',
    };
    updateSettings({ flash: next[settings.flash] });
  }, [settings.flash, updateSettings]);

  const cycleTimer = useCallback(() => {
    const options = [0, 3, 5, 10] as const;
    const idx = options.indexOf(settings.timer);
    updateSettings({ timer: options[(idx + 1) % options.length] });
  }, [settings.timer, updateSettings]);

  const showFlashBtn = settings.upperButtons?.flash ?? true;
  const showGridBtn = settings.upperButtons?.grid ?? true;
  const showTimerBtn = settings.upperButtons?.timer ?? true;

  return (
    <>
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 pt-12 safe-top z-20">
        {showFlashBtn ? (
          <button
            onClick={() => setShowFlash(!showFlash)}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50"
          >
            {settings.flash === 'off' ? (
              <ZapOff className="w-6 h-6 text-white/80" />
            ) : (
              <Zap className="w-6 h-6 text-yellow-400" />
            )}
          </button>
        ) : (
          <div className="w-10" />
        )}

        <div className="flex gap-2">
          {showGridBtn && (
            <button
              onClick={() => updateSettings({ grid: !settings.grid })}
              className={clsx(
                'p-2 rounded-full',
                settings.grid ? 'bg-white/20' : 'bg-black/30 hover:bg-black/50'
              )}
            >
              <Grid3X3 className="w-6 h-6 text-white" />
            </button>
          )}
          {showTimerBtn && (
            <button
              onClick={() => setShowTimer(!showTimer)}
              className={clsx(
                'p-2 rounded-full flex items-center gap-1',
                settings.timer > 0 ? 'bg-white/20' : 'bg-black/30 hover:bg-black/50'
              )}
            >
              <Timer className="w-6 h-6 text-white" />
              {settings.timer > 0 && (
                <span className="text-xs text-white">{settings.timer}s</span>
              )}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-24 left-4 bg-black/70 rounded-lg p-2 z-30"
          >
            {(['off', 'on', 'auto'] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  updateSettings({ flash: f });
                  setShowFlash(false);
                }}
                className={clsx(
                  'block w-full text-left px-4 py-2 rounded text-sm capitalize',
                  settings.flash === f ? 'bg-white/20' : 'hover:bg-white/10'
                )}
              >
                {f}
              </button>
            ))}
          </motion.div>
        )}
        {showTimer && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-24 right-4 bg-black/70 rounded-lg p-2 z-30"
          >
            {([0, 3, 5, 10] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  updateSettings({ timer: t });
                  setShowTimer(false);
                }}
                className={clsx(
                  'block w-full text-left px-4 py-2 rounded text-sm',
                  settings.timer === t ? 'bg-white/20' : 'hover:bg-white/10'
                )}
              >
                {t === 0 ? 'Off' : `${t}s`}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-4 z-20">
        <div className="flex items-center gap-2 bg-black/40 rounded-full px-3 py-1">
          <button
            onClick={() => onZoomChange(Math.max(1, zoom - 0.5))}
            className="text-white text-lg font-bold w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full"
          >
            −
          </button>
          <span className="text-white text-sm min-w-[3rem] text-center">
            {zoom.toFixed(1)}x
          </span>
          <button
            onClick={() => onZoomChange(Math.min(10, zoom + 0.5))}
            className="text-white text-lg font-bold w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full"
          >
            +
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 pb-8 pt-4 safe-bottom z-20">
        <div className="w-16" />
        <div className="flex items-center gap-6">
          <button
            onClick={onFlip}
            className="p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          >
            <RotateCcw className="w-7 h-7 text-white" />
          </button>

          <button
            onClick={isVideoMode ? (isRecording ? onStopRecord : onStartRecord) : onCapture}
            className={clsx(
              'relative flex items-center justify-center rounded-full transition-all',
              isVideoMode
                ? 'w-20 h-20 border-4 border-white'
                : 'w-20 h-20 border-4 border-white bg-white/20 hover:bg-white/30'
            )}
          >
            {isVideoMode && (
              <div
                className={clsx(
                  'absolute inset-2 rounded-full bg-red-500 transition-opacity',
                  isRecording ? 'opacity-100' : 'opacity-0'
                )}
              />
            )}
          </button>

          {onVoiceToggle && (
            <button
              onClick={onVoiceToggle}
              className={clsx(
                'p-3 rounded-full transition-colors',
                voiceActive ? 'bg-green-500/50' : 'bg-black/30 hover:bg-black/50'
              )}
            >
              {voiceActive ? (
                <Mic className="w-7 h-7 text-white" />
              ) : (
                <MicOff className="w-7 h-7 text-white/70" />
              )}
            </button>
          )}
        </div>
        <div className="w-16" />
      </div>
    </>
  );
}
