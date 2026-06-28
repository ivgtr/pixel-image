import type { ReactNode } from "react";
import type { TvEffectPreset } from "../../../server/pixelImage/tvEffect/types";

export const uiModes = ["lab", "arcade", "gallery", "artifact"] as const;

export type UiMode = (typeof uiModes)[number];

export type ImageSource =
  | { kind: "url"; url: string }
  | {
      kind: "upload";
      file: File;
      objectUrl: string;
      dataUrl: string;
      type: "png" | "jpeg";
    };

export type PixelImageSettings = {
  sampleSize: string;
  pixelSize: string;
  paletteSize: string;
  tvEffectEnabled: boolean;
  tvEffectPreset: TvEffectPreset;
  tvEffectStrength: string;
};

export type PixelImageResult = {
  originalPreviewUrl: string | undefined;
  generatedPreviewUrl: string | undefined;
  apiUrl: string | undefined;
  canShareApiUrl: boolean;
  isLoading: boolean;
  errorMessage: string | undefined;
};

export type CopyStatus = "idle" | "copied" | "failed";

export type PixelImageStudioController = {
  uiMode: UiMode;
  setUiMode: (uiMode: UiMode) => void;
  source: ImageSource;
  urlValue: string;
  settings: PixelImageSettings;
  result: PixelImageResult;
  copyStatus: CopyStatus;
  setUrlSource: (url: string) => void;
  setUploadFile: (file: File | undefined) => void;
  updateSetting: <T extends keyof PixelImageSettings>(
    key: T,
    value: PixelImageSettings[T],
  ) => void;
  reset: () => void;
  copyApiUrl: () => Promise<void>;
  downloadResult: () => void;
};

export type PixelImageStudioViewProps = {
  studio: PixelImageStudioController;
  themeSwitcher: ReactNode;
};

export type ComparisonMode = "side-by-side" | "split" | "toggle" | "stacked";

export const defaultImageUrl =
  "https://pbs.twimg.com/profile_images/1354479643882004483/Btnfm47p_400x400.jpg";

export const defaultSettings: PixelImageSettings = {
  sampleSize: "15",
  pixelSize: "15",
  paletteSize: "8",
  tvEffectEnabled: false,
  tvEffectPreset: "soft-tv",
  tvEffectStrength: "60",
};

export const maxUploadBytes = 5 * 1024 * 1024;

export const tvEffectPresetOptions: { value: TvEffectPreset; label: string; hint: string }[] = [
  { value: "soft-tv", label: "Soft TV", hint: "淡いにじみ" },
  { value: "ntsc", label: "NTSC", hint: "横方向の混色" },
  { value: "crt", label: "CRT", hint: "走査線を強調" },
  { value: "famicom-composite", label: "Famicom", hint: "滲むゲーム機感" },
  { value: "sharp-emulator", label: "Sharp", hint: "くっきり表示" },
];

export const resolveUiMode = (value: string | string[] | undefined): UiMode => {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (uiModes.includes(candidate as UiMode)) {
    return candidate as UiMode;
  }
  return "lab";
};

export const buildApiUrl = ({
  origin,
  imageUrl,
  settings,
}: {
  origin: string;
  imageUrl: string;
  settings: PixelImageSettings;
}): string => {
  const url = new URL("/api", origin);
  url.searchParams.set("image", imageUrl);
  url.searchParams.set("sampleSize", settings.sampleSize);
  url.searchParams.set("pixelSize", settings.pixelSize);
  url.searchParams.set("k", settings.paletteSize);
  url.searchParams.set("tv", settings.tvEffectEnabled ? "1" : "0");
  if (settings.tvEffectEnabled) {
    url.searchParams.set("tvPreset", settings.tvEffectPreset);
    url.searchParams.set("tvStrength", settings.tvEffectStrength);
  }
  return url.toString();
};

export const estimateOutputScale = (settings: PixelImageSettings): string => {
  const sampleSize = Number(settings.sampleSize);
  const pixelSize = Number(settings.pixelSize);
  if (!Number.isFinite(sampleSize) || !Number.isFinite(pixelSize) || sampleSize <= 0) {
    return "unknown";
  }
  const scale = pixelSize / sampleSize;
  return `${scale.toFixed(2)}x`;
};
