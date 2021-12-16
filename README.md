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
  - cell のサイズを`px`で指定
  - `default: 15`
- `?k=`
  - カラーの色数を指定
  - `default: 8`

```md
https://pixel-image.vercel.app/api?<url=画像の URL>&[size=cell のサイズ]&[k=カラーの色数]
```

## Demo

Web サイトで試すことができます。

- https://pixel-image.vercel.app

## License

MIT ©[ivgtr](https://github.com/ivgtr)

[![Twitter Follow](https://img.shields.io/twitter/follow/ivgtr?style=social)](https://twitter.com/ivgtr) [![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE) [![Donate](https://img.shields.io/badge/%EF%BC%84-support-green.svg?style=flat-square)](https://www.buymeacoffee.com/ivgtr)
