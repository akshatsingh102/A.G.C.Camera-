'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCameraStore } from '@/lib/store';
import { CAMERA_MODES } from '@/lib/constants';
import clsx from 'clsx';

export function ModeSlider() {
  const { mode, setMode } = useCameraStore();
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const active = el.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [mode]);

  return (
    <div
      ref={sliderRef}
      className="mode-slider flex gap-1 overflow-x-auto scroll-smooth px-2 py-3 max-w-full"
    >
      {CAMERA_MODES.map((m) => (
        <motion.button
          key={m.id}
          data-active={mode === m.id}
          onClick={() => setMode(m.id)}
          className={clsx(
            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors',
            mode === m.id
              ? 'bg-white/20 text-white'
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          )}
          whileTap={{ scale: 0.95 }}
        >
          <span className="mr-2">{m.icon}</span>
          {m.label}
        </motion.button>
      ))}
    </div>
  );
}
