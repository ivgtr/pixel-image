import classNames from "classnames";
import React, { memo } from "react";
import type { TvEffectPreset } from "../../../server/pixelImage/tvEffect/types";

const tvEffectPresetOptions: { value: TvEffectPreset; label: string }[] = [
  { value: "soft-tv", label: "Soft TV" },
  { value: "ntsc", label: "NTSC" },
  { value: "crt", label: "CRT" },
  { value: "famicom-composite", label: "Famicom Composite" },
  { value: "sharp-emulator", label: "Sharp Emulator" },
];

type TvEffectControlsProps = {
  enabled: boolean;
  preset: TvEffectPreset;
  strength: string;
  onEnabledChange: (enabled: boolean) => void;
  onPresetChange: (preset: TvEffectPreset) => void;
  onStrengthChange: (strength: string) => void;
};

export const TvEffectControls = memo(
  ({
    enabled,
    preset,
    strength,
    onEnabledChange,
    onPresetChange,
    onStrengthChange,
  }: TvEffectControlsProps) => {
    return (
      <div className={classNames("mt-4", "space-y-4")}>
        <div className={classNames("flex", "items-center", "w-full")}>
          <label htmlFor="tv-effect-enabled" className={classNames("text-white", "px-4", "py-2")}>
            TV Effect
          </label>
          <input
            id="tv-effect-enabled"
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.currentTarget.checked)}
            className={classNames("h-5", "w-5")}
          />
        </div>

        <div className={classNames("flex", "items-center", "w-full")}>
          <label htmlFor="tv-effect-preset" className={classNames("text-white", "px-4", "py-2")}>
            Preset
          </label>
          <select
            id="tv-effect-preset"
            value={preset}
            onChange={(e) => onPresetChange(e.currentTarget.value as TvEffectPreset)}
            className={classNames(
              "h-12",
              "px-4",
              "py-2",
              "border-2",
              "border-gray-600",
              "rounded-lg",
            )}
          >
            {tvEffectPresetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={classNames("flex", "items-center", "w-full")}>
          <label
            htmlFor="tv-effect-strength"
            className={classNames("text-white", "px-4", "py-2")}
          >
            Strength
          </label>
          <input
            id="tv-effect-strength"
            type="range"
            min="0"
            max="100"
            value={strength}
            onChange={(e) => onStrengthChange(e.currentTarget.value)}
            className={classNames("w-full")}
          />
          <span className={classNames("text-white", "px-4", "tabular-nums")}>{strength}</span>
        </div>
      </div>
    );
  },
);
