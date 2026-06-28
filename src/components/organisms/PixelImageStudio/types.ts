import type { TvEffectPreset } from "../../../server/pixelImage/tvEffect/types";

export type ImageSource =
  | { kind: "url"; url: string }
  | { kind: "upload"; file: File; objectUrl: string; dataUrl: string; type: "png" | "jpeg" };

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

export type StudioStatus = "idle" | "loading" | "ready" | "error";

export type PixelImageStudioState = {
  sourceKind: ImageSource["kind"];
  source: ImageSource;
  settings: PixelImageSettings;
  result: PixelImageResult;
  copied: boolean;
  fileError: string | undefined;
  outputEstimate: string;
  status: StudioStatus;
  setSourceKind: (kind: ImageSource["kind"]) => void;
  setUrl: (url: string) => void;
  setUploadFile: (file: File | undefined) => void;
  setSetting: <Key extends keyof PixelImageSettings>(
    key: Key,
    value: PixelImageSettings[Key],
  ) => void;
  reset: () => void;
  copyApiUrl: () => Promise<void>;
  downloadResult: () => void;
};
