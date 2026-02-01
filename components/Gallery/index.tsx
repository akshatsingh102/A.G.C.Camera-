'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useCameraStore } from '@/lib/store';
import { useState } from 'react';

interface GalleryProps {
  onClose: () => void;
}

export function Gallery({ onClose }: GalleryProps) {
  const { gallery, clearGallery } = useCameraStore();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Gallery</h2>
          <div className="flex gap-2">
            {gallery.length > 0 && (
              <button
                onClick={() => confirm('Clear all?') && clearGallery()}
                className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-lg"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {gallery.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/50">
              <p className="text-lg mb-2">No photos or videos yet</p>
              <p className="text-sm">Capture something to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {gallery.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setSelected(item.id)}
                  className="aspect-square rounded-lg overflow-hidden bg-white/5 relative group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.type === 'photo' ? (
                    <img
                      src={item.thumbnail || item.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                        />
                      )}
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-xs">
                        VIDEO
                      </div>
                    </>
                  )}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="w-12 h-12 rounded-full border-4 border-white flex items-center justify-center">
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                      </div>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {selected && (
          <GalleryViewer
            item={gallery.find((g) => g.id === selected)!}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

function GalleryViewer({ item, onClose }: { item: { type: string; url: string }; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 z-10"
      >
        <X className="w-6 h-6 text-white" />
      </button>
      {item.type === 'photo' ? (
        <img
          src={item.url}
          alt=""
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <video
          src={item.url}
          controls
          autoPlay
          className="max-w-full max-h-full"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </motion.div>
  );
}
