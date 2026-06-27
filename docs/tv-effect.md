# TV Effect

`pixel-image` supports an optional TV/NTSC/CRT-style post process for generated pixel images.

The effect is applied on the API side after pixelization, so the Web preview and the direct API output use the same rendered image.

## Query parameters

- `tv`
  - Enables the TV display effect.
  - `0` or `1`
  - Default: `0`
- `tvPreset`
  - Selects the effect preset.
  - `soft-tv` / `ntsc` / `crt` / `famicom-composite` / `sharp-emulator`
  - Default: `soft-tv`
- `tvStrength`
  - Controls the overall effect strength.
  - Range: `0 - 100`
  - Default: `60`

## Example

```md
https://pixel-image.vercel.app/api?image=https://github.com/ivgtr.png&tv=1&tvPreset=soft-tv&tvStrength=60
```

## Presets

| Preset | Purpose |
| --- | --- |
| `soft-tv` | Natural soft TV display with horizontal bleed as the main effect. |
| `ntsc` | Stronger composite-video-like bleed and slight chromatic offset. |
| `crt` | Stronger scanline and bloom for CRT-like output. |
| `famicom-composite` | Stronger horizontal bleed and color adjustment for composite-console output. |
| `sharp-emulator` | Minimal adjustment while preserving a sharper emulator-like image. |
