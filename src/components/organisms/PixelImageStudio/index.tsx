import classNames from "classnames";
import { usePixelImageStudio } from "./usePixelImageStudio";
import { ArtifactStudioVariant } from "./variants/ArtifactStudioVariant";
import { PixelLabVariant } from "./variants/PixelLabVariant";
import { QuietGalleryVariant } from "./variants/QuietGalleryVariant";
import { RetroArcadeVariant } from "./variants/RetroArcadeVariant";
import type { UiMode } from "./types";
import { uiModes } from "./types";

const uiModeLabels: Record<UiMode, string> = {
  lab: "Pixel Lab",
  arcade: "Arcade",
  gallery: "Gallery",
  artifact: "Artifact",
};

export const PixelImageStudio = () => {
  const studio = usePixelImageStudio();

  const themeSwitcher = (
    <nav aria-label="UI Mode" className="rounded-2xl border border-white/10 bg-black/30 p-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {uiModes.map((uiMode) => (
          <button
            key={uiMode}
            type="button"
            aria-pressed={studio.uiMode === uiMode}
            onClick={() => studio.setUiMode(uiMode)}
            className={classNames(
              "rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.18em] transition",
              studio.uiMode === uiMode
                ? "bg-white text-slate-950 shadow-lg shadow-white/10"
                : "bg-white/5 text-slate-200 hover:bg-white/10",
            )}
          >
            {uiModeLabels[uiMode]}
          </button>
        ))}
      </div>
    </nav>
  );

  if (studio.uiMode === "arcade") {
    return <RetroArcadeVariant studio={studio} themeSwitcher={themeSwitcher} />;
  }

  if (studio.uiMode === "gallery") {
    return <QuietGalleryVariant studio={studio} themeSwitcher={themeSwitcher} />;
  }

  if (studio.uiMode === "artifact") {
    return <ArtifactStudioVariant studio={studio} themeSwitcher={themeSwitcher} />;
  }

  return <PixelLabVariant studio={studio} themeSwitcher={themeSwitcher} />;
};
