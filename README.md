<div align="center">
  <h3>
    Pixel Image
  </h3>
  <p align="center">💾 画像をドット絵にするAPI及びWebサイト</p>
</div>

## Setup

`?image=` に画像の `URL` を指定すると、その画像をドット絵にして返します。

<div align="center">
  <h3>
    <img width="100" alt="crop icon" src="https://pixel-image.vercel.app/api?image=https://i.imgur.com/5fe7tawm.png">
  </h3>
</div>

```md
https://pixel-image.vercel.app/api?image=https://github.com/ivgtr.png
```

Markdown ファイルにも C&P して利用できます。

```md
[![pixel-image](https://pixel-image.vercel.app/api?image=https://github.com/ivgtr.png)](https://pixel-image.vercel.app/api?image=https://github.com/ivgtr.png)
```

### Config

- `?image=`
  - 画像の URL を指定
  - `required`
- `?size=`
  - 後方互換用。`sampleSize` と `pixelSize` の両方に同じ値を指定したものとして扱います。
  - `default: 15`
- `?sampleSize=`
  - 元画像を何px単位で代表色化するかを指定
  - 小さいほど細部を拾いやすくなります
  - `default: size` または `15`
- `?pixelSize=`
  - 出力時の1ドットを何pxで描画するかを指定
  - 大きいほど粗く大きなドットになります
  - `default: size` または `15`
- `?k=`
  - palette の色数を指定
  - UI上では Palette Size として扱います
  - `default: 8`
- `?tv=`
  - TV表示再現エフェクトを有効化
  - `0` または `1`
  - `default: 0`
- `?tvPreset=`
  - TV表示再現エフェクトのプリセットを指定
  - `tv=1` のときのみ有効
  - `soft-tv`, `ntsc`, `crt`, `famicom-composite`, `sharp-emulator`
  - `default: soft-tv`
- `?tvStrength=`
  - TV表示再現エフェクトの強さを `0` から `100` で指定
  - `tv=1` のときのみ有効
  - `default: 60`

```md
https://pixel-image.vercel.app/api?<url=画像の URL>&[sampleSize=元画像の読み取り単位]&[pixelSize=出力時の1ドットの大きさ]&[k=palette の色数]&[tv=0 or 1]&[tvPreset=プリセット]&[tvStrength=強さ]
```

`sampleSize` と `pixelSize` を分けると、出力画像サイズは `pixelSize` に従います。例えば元画像が `400x400`、`sampleSize=10`、`pixelSize=20` の場合、`40 cells * 20px = 800px` となり、出力画像は `800x800` になります。

```md
https://pixel-image.vercel.app/api?image=https://github.com/ivgtr.png&sampleSize=10&pixelSize=20&k=8
```

TV表示再現エフェクトの例。

```md
https://pixel-image.vercel.app/api?image=https://github.com/ivgtr.png&sampleSize=15&pixelSize=15&k=8&tv=1&tvPreset=soft-tv&tvStrength=60
```

## Demo

Web サイトで試すことができます。

- https://pixel-image.vercel.app

## License

MIT ©[ivgtr](https://github.com/ivgtr)

[![Twitter Follow](https://img.shields.io/twitter/follow/ivgtr?style=social)](https://twitter.com/ivgtr) [![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE) [![Donate](https://img.shields.io/badge/%EF%BC%84-support-green.svg?style=flat-square)](https://www.buymeacoffee.com/ivgtr)
