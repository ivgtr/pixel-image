import classNames from "classnames";
import React from "react";
import type { TvEffectPreset } from "../../../server/pixelImage/tvEffect/types";
import type { PixelImageSettings } from "../PixelImageStudio/types";

type ControlBarProps = {
  settings: PixelImageSettings;
  outputEstimate: string;
  onSettingChange: <Key extends keyof PixelImageSettings>(
    key: Key,
    value: PixelImageSettings[Key],
  ) => void;
};

const presets = [
  {
    label: "Tiny cartridge",
    sampleSize: "12",
    pixelSize: "20",
    paletteSize: "6",
  },
  {
    label: "Balanced lab",
    sampleSize: "15",
    pixelSize: "15",
    paletteSize: "8",
  },
  {
    label: "Poster proof",
    sampleSize: "8",
    pixelSize: "12",
    paletteSize: "14",
  },
];

const ControlSection = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <section className={classNames("space-y-3", "border-t", "border-cyan-200/10", "pt-4")}>
    <h3
      className={classNames(
        "text-[0.7rem]",
        "font-bold",
        "uppercase",
        "tracking-[0.18em]",
        "text-cyan-200/70",
      )}
    >
      {label}
    </h3>
    {children}
  </section>
);

const SliderField = ({
  id,
  label,
  value,
  min,
  max,
  help,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  min: number;
  max: number;
  help: string;
  onChange: (value: string) => void;
}) => (
  <label htmlFor={id} className={classNames("block", "space-y-2")}>
    <span className={classNames("flex", "items-center", "justify-between", "gap-3")}>
      <span className={classNames("text-sm", "font-semibold")}>{label}</span>
      <span
        className={classNames(
          "min-w-[3rem]",
          "border",
          "border-white/20",
          "bg-black/30",
          "px-2",
          "py-1",
          "text-center",
          "text-xs",
          "tabular-nums",
        )}
      >
        {value}
      </span>
    </span>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      className={classNames("w-full", "accent-current")}
    />
    <span className={classNames("block", "text-xs", "text-current", "opacity-70")}>{help}</span>
  </label>
);

export const ControlBar = ({
  settings,
  outputEstimate,
  onSettingChange,
}: ControlBarProps) => {
  return (
    <section
      className={classNames(
        "space-y-5",
        "border",
        "border-cyan-300/20",
        "bg-slate-950/70",
        "p-4",
        "text-cyan-50",
      )}
    >
      <div>
        <h2 className={classNames("text-sm", "font-bold", "uppercase", "tracking-[0.16em]")}>
          Calibration Deck
        </h2>
        <p className={classNames("mt-1", "text-xs", "text-cyan-100/60")}>{outputEstimate}</p>
      </div>

      <ControlSection label="Presets">
        <div className={classNames("grid", "gap-2")}>
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                onSettingChange("sampleSize", preset.sampleSize);
                onSettingChange("pixelSize", preset.pixelSize);
                onSettingChange("paletteSize", preset.paletteSize);
              }}
              className={classNames(
                "border",
                "border-cyan-200/20",
                "bg-cyan-100/5",
                "px-3",
                "py-2",
                "text-left",
                "text-xs",
                "font-semibold",
                "text-cyan-50",
                "hover:border-cyan-200/60",
                "focus:border-cyan-100",
                "focus:outline-none",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </ControlSection>

      <ControlSection label="Input Sampling">
        <SliderField
          id="sample-size"
          label="Sample Size"
          min={1}
          max={50}
          value={settings.sampleSize}
          help="小さいほど入力画像の細部を拾います。"
          onChange={(value) => onSettingChange("sampleSize", value)}
        />
      </ControlSection>

      <ControlSection label="Pixel Output">
        <SliderField
          id="pixel-size"
          label="Pixel Size"
          min={1}
          max={50}
          value={settings.pixelSize}
          help="大きいほど粗く、ドット感が強くなります。"
          onChange={(value) => onSettingChange("pixelSize", value)}
        />
      </ControlSection>

      <ControlSection label="Palette">
        <SliderField
          id="palette-size"
          label="Palette Size"
          min={1}
          max={32}
          value={settings.paletteSize}
          help="少ないほどゲーム機風、多いほど写真に近づきます。"
          onChange={(value) => onSettingChange("paletteSize", value)}
        />
      </ControlSection>

      <ControlSection label="Display Effect">
        <label htmlFor="tv-effect-enabled" className={classNames("flex", "items-center", "gap-3")}>
          <input
            id="tv-effect-enabled"
            type="checkbox"
            checked={settings.tvEffectEnabled}
            onChange={(event) => onSettingChange("tvEffectEnabled", event.currentTarget.checked)}
            className={classNames("h-5", "w-5", "accent-current")}
          />
          <span className={classNames("text-sm", "font-semibold")}>TV Effect</span>
        </label>

        <label htmlFor="tv-effect-preset" className={classNames("block", "space-y-1")}>
          <span className={classNames("text-xs", "font-semibold", "uppercase")}>Preset</span>
          <select
            id="tv-effect-preset"
            value={settings.tvEffectPreset}
            onChange={(event) =>
              onSettingChange("tvEffectPreset", event.currentTarget.value as TvEffectPreset)
            }
            className={classNames(
              "w-full",
              "border",
              "border-white/20",
              "bg-black",
              "px-3",
              "py-2",
              "text-sm",
              "text-white",
            )}
          >
            <option value="soft-tv">Soft TV</option>
            <option value="ntsc">NTSC</option>
            <option value="crt">CRT</option>
            <option value="famicom-composite">Famicom Composite</option>
            <option value="sharp-emulator">Sharp Emulator</option>
          </select>
        </label>

        <SliderField
          id="tv-effect-strength"
          label="TV Strength"
          min={0}
          max={100}
          value={settings.tvEffectStrength}
          help="にじみ、走査線、レトロ感の強さ。"
          onChange={(value) => onSettingChange("tvEffectStrength", value)}
        />
      </ControlSection>
    </section>
  );
};
