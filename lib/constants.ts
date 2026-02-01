import type { CameraMode, FilterType } from './types';

export const CAMERA_MODES: { id: CameraMode; label: string; icon: string }[] = [
  { id: 'photo', label: 'Photo', icon: '📷' },
  { id: 'video', label: 'Video', icon: '🎥' },
  { id: 'night', label: 'Night', icon: '🌙' },
  { id: 'portrait', label: 'Portrait', icon: '👤' },
  { id: 'ultra', label: '108MP', icon: '✨' },
  { id: 'slo-mo', label: 'Slo-Mo', icon: '🐢' },
  { id: 'panorama', label: 'Pano', icon: '🖼️' },
];

export const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'bw', label: 'B&W' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
];

export const RESOLUTIONS = {
  hd: { width: 1280, height: 720, label: 'HD' },
  fullhd: { width: 1920, height: 1080, label: 'Full HD' },
  '4k': { width: 3840, height: 2160, label: '4K' },
  '108mp': { width: 12032, height: 9024, label: '108MP' },
} as const;
