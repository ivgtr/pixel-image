import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildApiUrl,
  defaultImageUrl,
  defaultSettings,
  maxUploadBytes,
  resolveUiMode,
} from "./types";
import type {
  CopyStatus,
  ImageSource,
  PixelImageResult,
  PixelImageSettings,
  PixelImageStudioController,
  UiMode,
} from "./types";

const allowedUploadTypes = ["image/png", "image/jpeg"];
const conversionDelayMs = 450;

const createInitialResult = (): PixelImageResult => ({
  originalPreviewUrl: defaultImageUrl,
  generatedPreviewUrl: undefined,
  apiUrl: undefined,
  canShareApiUrl: true,
  isLoading: false,
  errorMessage: undefined,
});

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "画像の変換に失敗しました";
};

export const usePixelImageStudio = (): PixelImageStudioController => {
  const router = useRouter();
  const [uiMode, setUiModeState] = useState<UiMode>("lab");
  const [urlValue, setUrlValue] = useState(defaultImageUrl);
  const [source, setSource] = useState<ImageSource>({ kind: "url", url: defaultImageUrl });
  const [settings, setSettings] = useState<PixelImageSettings>(defaultSettings);
  const [result, setResult] = useState<PixelImageResult>(createInitialResult);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const uploadObjectUrlRef = useRef<string | undefined>();
  const generatedObjectUrlRef = useRef<string | undefined>();
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  useEffect(() => {
    if (!router.isReady) return;
    setUiModeState(resolveUiMode(router.query.ui));
  }, [router.isReady, router.query.ui]);

  const revokeGeneratedObjectUrl = useCallback(() => {
    if (!generatedObjectUrlRef.current) return;
    URL.revokeObjectURL(generatedObjectUrlRef.current);
    generatedObjectUrlRef.current = undefined;
  }, []);

  const revokeUploadObjectUrl = useCallback(() => {
    if (!uploadObjectUrlRef.current) return;
    URL.revokeObjectURL(uploadObjectUrlRef.current);
    uploadObjectUrlRef.current = undefined;
  }, []);

  useEffect(() => {
    return () => {
      revokeGeneratedObjectUrl();
      revokeUploadObjectUrl();
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, [revokeGeneratedObjectUrl, revokeUploadObjectUrl]);

  const setUiMode = useCallback(
    (nextUiMode: UiMode) => {
      setUiModeState(nextUiMode);
      if (typeof window === "undefined") return;

      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("ui", nextUiMode);
      void router.replace(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`, undefined, {
        shallow: true,
      });
    },
    [router],
  );

  const setUrlSource = useCallback(
    (url: string) => {
      setUrlValue(url);
      revokeUploadObjectUrl();
      setSource({ kind: "url", url });
    },
    [revokeUploadObjectUrl],
  );

  const setUploadFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;

      if (!allowedUploadTypes.includes(file.type)) {
        setResult((current) => ({
          ...current,
          isLoading: false,
          errorMessage: "PNG または JPEG の画像を選択してください。",
        }));
        return;
      }

      if (file.size > maxUploadBytes) {
        setResult((current) => ({
          ...current,
          isLoading: false,
          errorMessage: "アップロード画像が大きすぎます。5MB以下のPNG/JPEGを選択してください。",
        }));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => {
        setResult((current) => ({
          ...current,
          isLoading: false,
          errorMessage: "アップロード画像を読み込めませんでした。",
        }));
      };
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          setResult((current) => ({
            ...current,
            isLoading: false,
            errorMessage: "アップロード画像を data URL として読み込めませんでした。",
          }));
          return;
        }

        revokeUploadObjectUrl();
        const objectUrl = URL.createObjectURL(file);
        uploadObjectUrlRef.current = objectUrl;
        setSource({
          kind: "upload",
          file,
          objectUrl,
          dataUrl: reader.result,
          type: file.type === "image/png" ? "png" : "jpeg",
        });
      };
      reader.readAsDataURL(file);
    },
    [revokeUploadObjectUrl],
  );

  const updateSetting = useCallback(
    <T extends keyof PixelImageSettings>(key: T, value: PixelImageSettings[T]) => {
      setSettings((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => {
    revokeGeneratedObjectUrl();
    revokeUploadObjectUrl();
    setUrlValue(defaultImageUrl);
    setSource({ kind: "url", url: defaultImageUrl });
    setSettings(defaultSettings);
    setCopyStatus("idle");
    setResult(createInitialResult());
  }, [revokeGeneratedObjectUrl, revokeUploadObjectUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalPreviewUrl = source.kind === "url" ? source.url : source.objectUrl;
    if (source.kind === "url" && source.url.trim().length === 0) {
      revokeGeneratedObjectUrl();
      setResult({
        originalPreviewUrl: undefined,
        generatedPreviewUrl: undefined,
        apiUrl: undefined,
        canShareApiUrl: true,
        isLoading: false,
        errorMessage: "画像URLを入力してください。",
      });
      return;
    }

    const apiUrl =
      source.kind === "url"
        ? buildApiUrl({ origin: window.location.origin, imageUrl: source.url, settings })
        : undefined;
    const abortController = new AbortController();
    let isActive = true;

    setResult((current) => ({
      ...current,
      originalPreviewUrl,
      apiUrl,
      canShareApiUrl: source.kind === "url",
      isLoading: true,
      errorMessage: undefined,
    }));

    const timeout = setTimeout(async () => {
      try {
        const response =
          source.kind === "url"
            ? await fetch(apiUrl as string, { signal: abortController.signal })
            : await fetch("/api", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: abortController.signal,
                body: JSON.stringify({
                  imageDataUrl: source.dataUrl,
                  type: source.type,
                  sampleSize: settings.sampleSize,
                  pixelSize: settings.pixelSize,
                  k: settings.paletteSize,
                  tv: settings.tvEffectEnabled ? "1" : "0",
                  tvPreset: settings.tvEffectPreset,
                  tvStrength: settings.tvEffectStrength,
                }),
              });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || `画像の変換に失敗しました: ${response.status}`);
        }

        const blob = await response.blob();
        if (!isActive) return;

        revokeGeneratedObjectUrl();
        const generatedPreviewUrl = URL.createObjectURL(blob);
        generatedObjectUrlRef.current = generatedPreviewUrl;
        setResult({
          originalPreviewUrl,
          generatedPreviewUrl,
          apiUrl,
          canShareApiUrl: source.kind === "url",
          isLoading: false,
          errorMessage: undefined,
        });
      } catch (error) {
        if (!isActive || abortController.signal.aborted) return;
        revokeGeneratedObjectUrl();
        setResult({
          originalPreviewUrl,
          generatedPreviewUrl: undefined,
          apiUrl,
          canShareApiUrl: source.kind === "url",
          isLoading: false,
          errorMessage: getErrorMessage(error),
        });
      }
    }, conversionDelayMs);

    return () => {
      isActive = false;
      clearTimeout(timeout);
      abortController.abort();
    };
  }, [revokeGeneratedObjectUrl, settings, source]);

  const copyApiUrl = useCallback(async () => {
    if (!result.apiUrl || !result.canShareApiUrl) return;

    try {
      await navigator.clipboard.writeText(result.apiUrl);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }

    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopyStatus("idle"), 1800);
  }, [result.apiUrl, result.canShareApiUrl]);

  const downloadResult = useCallback(() => {
    if (!result.generatedPreviewUrl || typeof document === "undefined") return;

    const anchor = document.createElement("a");
    anchor.href = result.generatedPreviewUrl;
    anchor.download = "pixel-image-output.png";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }, [result.generatedPreviewUrl]);

  return {
    uiMode,
    setUiMode,
    source,
    urlValue,
    settings,
    result,
    copyStatus,
    setUrlSource,
    setUploadFile,
    updateSetting,
    reset,
    copyApiUrl,
    downloadResult,
  };
};
