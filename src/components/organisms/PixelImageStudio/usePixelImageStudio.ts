import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ImageSource, PixelImageSettings, StudioStatus } from "./types";

const defaultImageUrl =
  "https://pbs.twimg.com/profile_images/1354479643882004483/Btnfm47p_400x400.jpg";
const maxUploadBytes = 5 * 1024 * 1024;

const defaultSettings: PixelImageSettings = {
  sampleSize: "15",
  pixelSize: "15",
  paletteSize: "8",
  tvEffectEnabled: false,
  tvEffectPreset: "soft-tv",
  tvEffectStrength: "60",
};

const createApiUrl = (
  source: ImageSource,
  settings: PixelImageSettings,
  origin: string | undefined,
): string | undefined => {
  if (!origin || source.kind !== "url" || !source.url.trim()) return;

  const url = new URL("/api", origin);
  url.searchParams.set("image", source.url.trim());
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

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read image file"));
      }
    };
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });
};

const subscribeToLocationOrigin = () => {
  return () => undefined;
};

const getLocationOrigin = () => window.location.origin;
const getServerLocationOrigin = () => undefined;

export const usePixelImageStudio = () => {
  const generatedPreviewUrlRef = useRef<string | undefined>(undefined);
  const origin = useSyncExternalStore(
    subscribeToLocationOrigin,
    getLocationOrigin,
    getServerLocationOrigin,
  );
  const [sourceKind, setSourceKindState] = useState<ImageSource["kind"]>("url");
  const [source, setSource] = useState<ImageSource>({ kind: "url", url: defaultImageUrl });
  const [settings, setSettings] = useState<PixelImageSettings>(defaultSettings);
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [fileError, setFileError] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);

  const activeSource = source.kind === sourceKind ? source : undefined;
  const apiUrl = useMemo(
    () => (activeSource ? createApiUrl(activeSource, settings, origin) : undefined),
    [activeSource, origin, settings],
  );
  const originalPreviewUrl =
    activeSource?.kind === "url" ? activeSource.url : activeSource?.objectUrl;

  useEffect(() => {
    return () => {
      if (generatedPreviewUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(generatedPreviewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      setErrorMessage(undefined);
      if (!activeSource) {
        setGeneratedPreviewUrl(undefined);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      try {
        const response =
          activeSource.kind === "url"
            ? await fetch(apiUrl ?? "")
            : await fetch("/api", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  imageDataUrl: activeSource.dataUrl,
                  type: activeSource.type,
                  sampleSize: settings.sampleSize,
                  pixelSize: settings.pixelSize,
                  k: settings.paletteSize,
                  tv: settings.tvEffectEnabled ? "1" : "0",
                  tvPreset: settings.tvEffectPreset,
                  tvStrength: settings.tvEffectStrength,
                }),
              });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setGeneratedPreviewUrl(objectUrl);
        if (generatedPreviewUrlRef.current?.startsWith("blob:")) {
          URL.revokeObjectURL(generatedPreviewUrlRef.current);
        }
        generatedPreviewUrlRef.current = objectUrl;
      } catch (error) {
        setGeneratedPreviewUrl(undefined);
        setErrorMessage(error instanceof Error ? error.message : "Image conversion failed");
      } finally {
        setIsLoading(false);
      }
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [activeSource, apiUrl, settings]);

  const setSourceKind = useCallback((kind: ImageSource["kind"]) => {
    setSourceKindState(kind);
    setFileError(undefined);
    setErrorMessage(undefined);
  }, []);

  const setUrl = useCallback((url: string) => {
    setSourceKindState("url");
    setSource({ kind: "url", url });
  }, []);

  const setUploadFile = useCallback(async (file: File | undefined) => {
    setFileError(undefined);
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setFileError("PNG または JPEG だけをアップロードできます。");
      return;
    }
    if (file.size > maxUploadBytes) {
      setFileError("アップロード画像は5MB以下にしてください。");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const objectUrl = URL.createObjectURL(file);
      setSource((current) => {
        if (current.kind === "upload") {
          URL.revokeObjectURL(current.objectUrl);
        }
        return {
          kind: "upload",
          file,
          objectUrl,
          dataUrl,
          type: file.type === "image/png" ? "png" : "jpeg",
        };
      });
      setSourceKindState("upload");
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "ファイルを読み込めませんでした。");
    }
  }, []);

  const setSetting = useCallback(
    <Key extends keyof PixelImageSettings>(key: Key, value: PixelImageSettings[Key]) => {
      setSettings((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => {
    setSource((current) => {
      if (current.kind === "upload") {
        URL.revokeObjectURL(current.objectUrl);
      }
      return { kind: "url", url: defaultImageUrl };
    });
    setSourceKindState("url");
    setSettings(defaultSettings);
    setFileError(undefined);
    setErrorMessage(undefined);
  }, []);

  const copyApiUrl = useCallback(async () => {
    if (!apiUrl || sourceKind !== "url") return;
    await navigator.clipboard.writeText(apiUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [apiUrl, sourceKind]);

  const downloadResult = useCallback(() => {
    if (!generatedPreviewUrl) return;
    const link = document.createElement("a");
    link.href = generatedPreviewUrl;
    link.download = "pixel-image-output.png";
    link.click();
  }, [generatedPreviewUrl]);

  const outputEstimate = useMemo(() => {
    const sampleSize = Number(settings.sampleSize);
    const pixelSize = Number(settings.pixelSize);
    if (!Number.isFinite(sampleSize) || !Number.isFinite(pixelSize)) return "Pending";
    return `ceil(width / ${sampleSize}) x ${pixelSize}px cells`;
  }, [settings.pixelSize, settings.sampleSize]);

  const status: StudioStatus = errorMessage
    ? "error"
    : isLoading
      ? "loading"
      : generatedPreviewUrl
        ? "ready"
        : "idle";

  return {
    sourceKind,
    source,
    settings,
    result: {
      originalPreviewUrl,
      generatedPreviewUrl,
      apiUrl,
      canShareApiUrl: sourceKind === "url" && Boolean(apiUrl),
      isLoading,
      errorMessage,
    },
    copied,
    fileError,
    outputEstimate,
    status,
    setSourceKind,
    setUrl,
    setUploadFile,
    setSetting,
    reset,
    copyApiUrl,
    downloadResult,
  };
};
