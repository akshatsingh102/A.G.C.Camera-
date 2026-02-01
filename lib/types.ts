export type CameraMode =
  | 'photo'
  | 'video'
  | 'night'
  | 'portrait'
  | 'ultra'
  | 'slo-mo'
  | 'panorama';

export type FlashMode = 'off' | 'on' | 'auto';

export type TimerOption = 0 | 3 | 5 | 10;

export type Resolution = 'hd' | 'fullhd' | '4k' | '108mp';

export type CameraTheme = 'minimal' | 'iphone' | 'samsung';

export type FilterType =
  | 'none'
  | 'vintage'
  | 'cinematic'
  | 'bw'
  | 'warm'
  | 'cool';

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  timestamp: number;
}

export interface UpperButtonsConfig {
  flash: boolean;
  grid: boolean;
  timer: boolean;
  gallery: boolean;
}

export interface CameraSettings {
  flash: FlashMode;
  grid: boolean;
  timer: TimerOption;
  resolution: Resolution;
  theme: CameraTheme;
  filter: FilterType;
  darkMode: boolean;
  aiFaceDetection: boolean;
  aiSceneDetection: boolean;
  aiEnhance: boolean;
  aiStabilization: boolean;
  upperButtons: UpperButtonsConfig;
}
