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
  - 入力の細かさを指定します
  - 元画像を何px単位のマスに分けて代表色化するかを決めます
  - 小さいほど多くのマスに分かれ、細部を拾いやすくなります
  - `default: size` または `15`
- `?pixelSize=`
  - 出力の拡大率を指定します
  - `sampleSize` で作った1マスを、出力時に何px四方で描くかを決めます
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

`sampleSize` は「入力を何pxごとに読むか」、`pixelSize` は「その1マスを出力で何px四方に描くか」です。

出力画像サイズの目安は以下です。

```text
出力幅 ≒ ceil(元画像幅 / sampleSize) × pixelSize
出力高さ ≒ ceil(元画像高さ / sampleSize) × pixelSize
```

例えば元画像が `400x400`、`sampleSize=10`、`pixelSize=20` の場合、`40 cells * 20px = 800px` となり、出力画像は `800x800` になります。

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

### WebUI

WebUIでは画像URL入力とローカル画像アップロードを切り替えて使えます。

- URL入力: 同一デプロイのGET `/api` を使い、共有可能なAPI URLを生成します。
- Upload入力: PNG / JPEG をブラウザで読み込み、POST `/api` で一時的に変換します。
- Upload画像はサーバーに永続保存されず、共有URL化もされません。

WebUIはPixel Lab方向のワークベンチUIです。画像を観察しながら `Sample Size`、
`Pixel Size`、`Palette Size`、TV Effectを調整し、Before / Afterで結果を比較できます。

APIのGET利用例は従来どおりURL画像向けです。`sampleSize` は元画像を読む細かさ、
`pixelSize` は出力ドットの大きさ、`k` はPalette Sizeとして使う色数を表します。

## License

MIT ©[ivgtr](https://github.com/ivgtr)

[![Twitter Follow](https://img.shields.io/twitter/follow/ivgtr?style=social)](https://twitter.com/ivgtr) [![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE) [![Donate](https://img.shields.io/badge/%EF%BC%84-support-green.svg?style=flat-square)](https://www.buymeacoffee.com/ivgtr)
