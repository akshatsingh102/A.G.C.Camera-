import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CameraMode,
  FlashMode,
  TimerOption,
  Resolution,
  CameraTheme,
  FilterType,
  CameraSettings,
  UpperButtonsConfig,
  MediaItem,
} from './types';

interface CameraState {
  mode: CameraMode;
  settings: CameraSettings;
  gallery: MediaItem[];
  setMode: (mode: CameraMode) => void;
  updateSettings: (settings: Partial<CameraSettings>) => void;
  addToGallery: (item: MediaItem) => void;
  clearGallery: () => void;
}

const defaultSettings: CameraSettings = {
  flash: 'off',
  grid: false,
  timer: 0,
  resolution: 'fullhd',
  theme: 'minimal',
  filter: 'none',
  darkMode: true,
  aiFaceDetection: true,
  aiSceneDetection: true,
  aiEnhance: false,
  aiStabilization: true,
};

export const useCameraStore = create<CameraState>()(
  persist(
    (set) => ({
      mode: 'photo',
      settings: defaultSettings,
      gallery: [],
      setMode: (mode) => set({ mode }),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      addToGallery: (item) =>
        set((state) => ({
          gallery: [item, ...state.gallery],
        })),
      clearGallery: () => set({ gallery: [] }),
    }),
    {
      name: 'ai-camera-storage',
      partialize: (state) => ({
        settings: state.settings,
        gallery: state.gallery,
      }),
    }
  )
);
