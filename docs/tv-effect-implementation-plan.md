# TV表示再現エフェクト 実装計画書

## 1. 目的

`ivgtr/pixel-image` に、ドット絵画像へ「昔のTV表示再現」「NTSC/CRT風表示エフェクト」を追加するための実装計画を定義する。

この文書は、現在の `main` ブランチの構成に合わせて、後続の実装者が既存コードの構成に沿って実装タスクへ分解できる粒度で、方針、変更箇所、処理順、テスト観点を明確にすることを目的とする。

この計画書作成タスクではアプリケーション実装は行わない。機能コード変更、コミット、PR作成も行わない。

## 2. 現在の前提

現在の `pixel-image` は、画像URLを受け取り、API側で画像をドット絵化して返すNext.jsアプリケーションである。Web UIは生成されたAPI URLを組み立て、そのURLを `img` の `src` としてプレビューしている。

主な機能は以下。

- 画像URLを指定する
- `size` でセルサイズを指定する
- `k` で色数を指定する
- APIが生成画像を `jpeg` または `png` として返す
- Web UIは生成画像URLを組み立ててプレビューする

今回追加したいTV表示再現エフェクトは、単なるぼかしではなく、ドット絵を昔のブラウン管TVやコンポジット映像で表示したときのように見せるポストプロセスである。

特に重要なのは、横方向の色にじみによって隣接色が混ざり、少ない色数のドット絵でも中間色が増えたように見えること。目、口、髪のハイライト、肌影の境界が自然に見えることを優先する。

## 3. 目指す見た目

目指す見た目は以下。

- ドット絵の硬い輪郭が少し柔らかく見える
- 横方向の色にじみで隣接ピクセルの色が混ざる
- 4色程度の絵でも、表示上は5色以上あるように感じる
- 目、口、肌影、髪ハイライトの境界が自然に見える
- RGBチャンネルの軽いズレでコンポジット映像風の色収差が出る
- スキャンラインによって昔のTV/エミュレーター風になる
- 明部に弱いブルームが入り、白や肌ハイライトが硬くなりすぎない
- 色味、コントラストをプリセットで変えられる
- やりすぎたグリッチ表現ではなく、ドット絵を見やすく補正する方向に寄せる

優先順位は以下。

1. 横方向の色にじみ
2. プレビューとAPI出力の一致
3. プリセットによる調整
4. スキャンライン
5. RGBチャンネルずらし
6. 弱いブルーム
7. 色味補正

## 4. 現行リポジトリ調査

### 4.1 技術スタック

現在の `main` で確認した技術スタックは以下。

| 項目 | 内容 |
| --- | --- |
| Framework | Next.js 16.2.9 |
| UI | React 19.2.7 |
| 言語 | TypeScript 5.9 |
| 画像処理 | `canvas` 3.2.3 / node-canvas |
| HTTP取得 | Node標準 `fetch` |
| 画像検証 | content-type、byte limit、redirect、DNS解決、private/local address blocking |
| CSS | Tailwind CSS 3.4 |
| package manager | `package-lock.json` が存在するため npm 前提 |
| Node | `24.x` 指定 |
| Lint | ESLint 9 flat config |
| Format | Prettier |
| Test | Vitest |

主要スクリプト。

| script | 用途 |
| --- | --- |
| `npm run dev` | Next.js 開発サーバ |
| `npm run build` | production build |
| `npm run start` | build済みアプリの起動 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest API test suite |
| `npm run lint` | src と tests の ESLint |
| `npm run lint:web` | JSX/TSX/CSS/SCSS の ESLint |
| `npm run lint:api` | JS/TS API/helper の ESLint |
| `npm run format` | Prettier |
| `npm run audit` | `npm audit --omit=dev` |
| `npm run proxy` | port 3000 を ngrok で公開 |

### 4.2 現行ファイル構成

主なファイルは以下。

```text
src/pages/index.tsx
src/pages/api/index.ts
src/server/pixelImage/analyzer.ts
src/server/pixelImage/cluster.ts
src/server/pixelImage/createImage.ts
src/server/pixelImage/parser.ts
src/components/organisms/Form/index.tsx
src/components/organisms/Preview/index.tsx
tests/api/analyzer.test.ts
tests/api/parser.test.ts
docs/dependency-modernization.md
```

以前の `src/pages/api/_lib/` 配下の画像処理ヘルパーは、現在は `src/server/pixelImage/` 配下へ移動済みである。TVエフェクトも `src/server/pixelImage/` 配下へ追加する。

### 4.3 画像処理フロー

現在の画像処理フローは以下。

1. Web UIで画像URL、セルサイズ、色数を入力する
2. `src/pages/index.tsx` が `/api` のURLを生成する
3. `image`, `size`, `k` をクエリパラメータとして付与する
4. `Preview` が生成されたURLを `img` の `src` に設定する
5. `/api` がリクエストを受け取る
6. `parseRequest` がクエリを `ParsedOptions` に変換する
7. `createImage` が `analyzeImage` を呼ぶ
8. `analyzeImage` が画像URLを検証し、fetchし、Buffer化する
9. node-canvasで元画像を描画する
10. セル単位で平均色を計算する
11. `cluster` で色数を減らす
12. `pixelCanvas` にセル単位で矩形を描く
13. `jpeg` または `png` のBufferとして返す

TVエフェクトは、既存のドット絵化処理の後、`pixelCanvas` に対するポストプロセスとして入れる。

推奨位置。

```text
元画像取得
  ↓
セル単位の平均色計算
  ↓
減色
  ↓
ドット絵としてpixelCanvasへ描画
  ↓
TV表示再現エフェクト
  ↓
PNG/JPEG出力
```

### 4.4 UI構成

現在のUI構成は以下。

```text
src/pages/index.tsx
  ├─ DefaultLayout
  ├─ Preview
  └─ Form
       ├─ Input
       └─ SizeInput
```

現状の `Form` は以下の3入力を持つ。

- URL
- Cell-Size
- K-Size

`Form` 内部で状態を持ち、1秒のdebounce後に `handleImageUrl(imgUrl, cellSize, kSize)` を呼ぶ。

TVエフェクトUIを追加する場合、MVPでは既存フォームに直接追加してもよい。ただし、UI要素が増えるため、最初から `TvEffectControls` を分離する方が読みやすい。

推奨構成。

```text
src/components/organisms/Form/index.tsx
  ├─ Input
  ├─ SizeInput
  └─ TvEffectControls
```

### 4.5 エクスポート処理

専用のExportボタンやダウンロード処理は現在ない。APIが画像そのものを返し、Web UIのプレビューもそのAPI URLを直接表示している。そのため、TVエフェクトをAPI側の画像生成処理に入れることで、プレビューと保存結果を一致させやすい。

エクスポート観点で重要な点。

- TVエフェクトのON/OFF、プリセット、強度はURLクエリに含める
- 同じURLなら同じ画像が返るようにする
- ランダムなノイズや揺らぎはMVPでは入れない
- 将来ノイズを入れる場合は `seed` を明示的に受け取る
- `Cache-Control: public, max-age=86400` があるため、見た目に影響する全パラメータをURLに含める

### 4.6 現行設計上の制約

#### 制約1: 処理はサーバーAPI側が中心

画像処理はブラウザではなく `/api` の `createImage` で行われている。WebGLやCSSだけで表現すると、プレビューとAPI出力が一致しない。MVPではAPI側で完結するCanvas 2D処理を優先する。

#### 制約2: 依存追加は避ける

現在は `canvas` 3.2.3 を利用している。MVPの表現は `ImageData` ベースで実装できるため、新しい画像処理ライブラリは追加しない。

#### 制約3: 現在の `Form` は引数が固定

`handleImageUrl` は現在 `origUrl`, `size`, `k` の3引数を受け取る設計である。TVエフェクト追加時は、引数を増やすよりもオブジェクト形式へ寄せる方が今後の拡張に強い。

現状。

```ts
handleImageUrl(origUrl: string, size: string, k: string)
```

推奨。

```ts
handleImageUrl(options: ImageFormOptions)
```

ただし、最初のPRの差分を小さくするなら、第4引数として `tvEffect` を渡す案も成立する。

#### 制約4: parserは範囲検証済み

`parseRequest` は現在 `image`, `type`, `size`, `k` を扱い、配列クエリ、不正type、不正整数、範囲外をエラーにしている。

TVエフェクトでは以下を同じ方針で追加する。

- `tv`, `tvPreset`, `tvStrength` の配列を拒否する
- `tvPreset` は型ガードで許可値のみ受け取る
- `tvStrength` は整数として受け取り、`0 - 100` の範囲に制限する
- `tv` 未指定または `0` ではエフェクト無効にする

#### 制約5: 非正方形画像の既存問題

`createImage` 内で `pixelCanvas` の幅が `rHeight * size` で作られている。

```ts
const pixelCanvas = createCanvas(rHeight * size, rHeight * size);
```

非正方形画像で期待通りの幅にならない可能性がある。TVエフェクトは出力キャンバスの `width` / `height` に対する後処理であるため、エフェクト実装前にこの問題を解消する。

- `createCanvas(rWidth * size, rHeight * size)` へ修正する
- セル数は `ceil` ベースにして、小さい画像や端の余りピクセルを失わない
- 平均色計算では実画像範囲内だけをサンプリングする
- TVエフェクト関数には明示的に `width` / `height` を渡す

#### 制約6: `cluster` のランダム初期値

色数削減のクラスタ初期値がランダム生成であるため、既存仕様として同一入力でも完全に同じ結果にならない可能性がある。APIキャッシュやTVエフェクト比較に影響するため、TVエフェクト実装前に決定的な初期値選択へ修正する。

## 5. エフェクト仕様

### 5.1 横方向の色にじみ

最重要要素。

狙い。

- ドット絵の隣接色を横方向に混ぜる
- 輪郭を柔らかくする
- 目、口、肌影、髪ハイライトの境界を自然にする
- 縦方向の情報はなるべく保つ
- 単なる全方向ブラーにしない

MVP仕様。

`pixelCanvas` の `ImageData` に対して、横方向のみの1Dブラーを適用する。

```text
for each y:
  for each x:
    left   = pixel(x - radius, y)
    center = pixel(x, y)
    right  = pixel(x + radius, y)

    mixed = center * centerWeight
          + left   * sideWeight
          + right  * sideWeight
```

MVPでは、半径1から2px程度から始める。

パラメータ案。

| パラメータ | 型 | 範囲 | 初期値 | 説明 |
| --- | ---: | ---: | ---: | --- |
| `horizontalBleed` | number | `0.0 - 1.0` | `0.35` | 横にじみの強さ |
| `bleedRadius` | number | `0 - 4` | `1` | 横方向に参照する半径 |
| `bleedStrength` | number | `0.0 - 1.0` | `0.35` | 中心色と周辺色の混合率 |

UI上は `Strength` に統合し、内部パラメータとして `bleedStrength` を持つ。

### 5.2 RGBチャンネルずらし

狙い。

- コンポジット映像風の軽い色収差を作る
- Rを少し右へ、Bを少し左へずらす
- Gは基準位置にする
- グリッチ風にならないよう弱くする

MVP仕様。

`ImageData` をもとに、各出力ピクセルのR/G/Bを別位置からサンプリングする。

```text
out.r = sample(in, x - redOffset, y).r
out.g = sample(in, x, y).g
out.b = sample(in, x - blueOffset, y).b
```

パラメータ案。

| パラメータ | 型 | 範囲 | 初期値 | 説明 |
| --- | ---: | ---: | ---: | --- |
| `chromaticAberration` | number | `0.0 - 1.0` | `0.18` | 色収差全体の強さ |
| `redOffset` | number | `-3 - 3` | `1` | Rチャンネルの横方向ズレ |
| `blueOffset` | number | `-3 - 3` | `-1` | Bチャンネルの横方向ズレ |

MVPでは `redOffset` / `blueOffset` をUIに出さず、プリセットと `Strength` から内部計算する。

### 5.3 スキャンライン

狙い。

- 昔のTV/CRT/エミュレーター表示らしさを出す
- 水平方向の明暗パターンを重ねる
- 画像の視認性を落としすぎない

MVP仕様。

画像の各y座標に対して、周期的に輝度を下げる。

```text
linePhase = y % scanlineFrequency

if linePhase < scanlineThickness:
  rgb *= 1 - scanlineStrength
```

パラメータ案。

| パラメータ | 型 | 範囲 | 初期値 | 説明 |
| --- | ---: | ---: | ---: | --- |
| `scanlineStrength` | number | `0.0 - 0.5` | `0.12` | 暗くする強度 |
| `scanlineFrequency` | number | `1 - 6` | `2` | 何px周期で線を入れる |
| `scanlineThickness` | number | `1 - 3` | `1` | 暗線の太さ |

### 5.4 ブルーム

狙い。

- 白、肌ハイライト、髪の明部を柔らかくする
- ドット絵の情報を潰さない程度に明部だけをにじませる
- 横にじみでは補えない明るい部分の発光感を弱く足す

MVP仕様。

1. 輝度が `bloomThreshold` 以上のピクセルを抽出する
2. 抽出結果を小さな半径でブラーする
3. 元画像に `bloomStrength` で加算合成する

輝度計算。

```text
luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
```

パラメータ案。

| パラメータ | 型 | 範囲 | 初期値 | 説明 |
| --- | ---: | ---: | ---: | --- |
| `bloomStrength` | number | `0.0 - 0.5` | `0.08` | ブルームの合成強度 |
| `bloomThreshold` | number | `0 - 255` | `210` | 明部抽出の閾値 |
| `bloomRadius` | number | `0 - 6` | `2` | ブラー半径 |

### 5.5 色味・コントラスト補正

狙い。

- TVやFC互換機によって変わる色味をプリセットで吸収する
- 暖色寄り、寒色寄り、彩度高め、黒浮きなどを調整できる余地を残す

MVP仕様。

出力直前にRGBへ補正をかける。

| パラメータ | 型 | 範囲 | 初期値 | 説明 |
| --- | ---: | ---: | ---: | --- |
| `saturation` | number | `0.0 - 2.0` | `1.05` | 彩度 |
| `contrast` | number | `0.5 - 2.0` | `1.03` | コントラスト |
| `gamma` | number | `0.5 - 2.5` | `1.0` | ガンマ |
| `brightness` | number | `0.5 - 1.5` | `1.0` | 明るさ |
| `blackLevel` | number | `0.0 - 0.2` | `0.0` | 黒レベル補正 |

MVPのUIでは詳細値を出さず、プリセットと `Strength` で決める。

### 5.6 プリセット

MVPで用意するプリセット。

| preset | 狙い | 特徴 |
| --- | --- | --- |
| `soft-tv` | 最も自然なTV風 | 横にじみ中心、弱いスキャンライン、弱いブルーム |
| `ntsc` | コンポジット映像寄り | 横にじみ強め、RGBズレあり、彩度やや高め |
| `crt` | CRTらしさ優先 | スキャンライン強め、ブルームあり、コントラスト少し高め |
| `famicom-composite` | FC互換機/コンポジット風 | 横にじみ強め、色味の癖を少し強くする |
| `sharp-emulator` | エミュレーターの軽い表示補正 | にじみ弱め、輪郭を残す、スキャンライン弱め |

将来追加候補。

- `warm-tv`
- `cool-tv`
- `vhs-soft`
- `rf-noisy`
- `pvm-monitor`

MVPでは `warm-tv` / `cool-tv` は入れない。

## 6. 採用方針

MVPでは **Canvas 2D / node-canvas によるAPI側ポストプロセス** を採用する。

理由。

- 既存の画像生成フローがAPI側にある
- Web UIはAPI画像を表示しているだけなので、APIに入れればプレビューと保存結果が一致する
- 追加依存を避けられる
- 既存の `createImage` に自然に組み込める
- まずMVPを小さく作れる
- 将来WebGLプレビューを足す場合も、API版を基準実装として使える

CSS filterやWebGLだけで実装する案は、プレビューとAPI出力が一致しないためMVPでは採用しない。

## 7. MVP実装計画

### 7.1 MVPで入れる機能

- TV Effect ON/OFF
- Preset選択
- Strength一括調整
- APIクエリへのTVエフェクト設定追加
- API側のポストプロセス
- 横方向の色にじみ
- 軽いRGBチャンネルずらし
- スキャンライン
- 軽いブルーム
- 最終的な色味、コントラスト補正
- プレビューとAPI出力の一致
- READMEまたはdocsへのパラメータ説明追加
- parserとエフェクト純粋関数のVitest追加

MVPのUIは以下に絞る。

```text
TV Effect: ON/OFF
Preset: soft-tv / ntsc / crt / famicom-composite / sharp-emulator
Strength: 0 - 100
```

詳細パラメータはUIに出さない。

### 7.2 MVPでは入れない機能

- WebGL / shader実装
- CSS overlayだけのプレビュー実装
- phosphor mask
- CRT画面の湾曲
- vignette
- RFノイズ
- VHSノイズ
- 時間変化するノイズ
- seed付きランダム揺らぎ
- Advanced Settingsの全項目UI
- プリセットの大量追加
- 専用Exportボタン
- Web Worker / OffscreenCanvas
- Node / Next / React のアップグレード

### 7.3 推奨する実装順序

1. 非正方形画像、小画像、端セル、平均色計算、クラスタ初期値の既存問題を修正する
2. 既存画像生成のVitestを追加する
3. 型定義とデフォルト値を追加する
4. プリセットとStrength反映ロジックを追加する
5. `parseRequest` にTVエフェクト用クエリを追加する
6. parserのVitestを追加する
7. `applyTvEffect` の空実装を追加する
8. 横方向の色にじみを実装する
9. RGBチャンネルずらしを実装する
10. スキャンラインを実装する
11. ブルームを実装する
12. 色味、コントラスト補正を実装する
13. エフェクト純粋関数のVitestを追加する
14. `createImage` のドット絵生成後にTVエフェクト処理を差し込む
15. UIからクエリを生成できるようにする
16. READMEを更新する
17. API URLを直接開いて保存結果を確認する
18. Web UIで表示確認する

### 7.4 想定変更ファイル

新規追加候補。

| ファイル | 目的 |
| --- | --- |
| `docs/tv-effect-implementation-plan.md` | 本設計書 |
| `src/server/pixelImage/tvEffect/types.ts` | TVエフェクト関連型 |
| `src/server/pixelImage/tvEffect/presets.ts` | プリセット定義 |
| `src/server/pixelImage/tvEffect/applyTvEffect.ts` | エフェクト統合処理 |
| `src/server/pixelImage/tvEffect/horizontalBleed.ts` | 横方向にじみ |
| `src/server/pixelImage/tvEffect/chromaticAberration.ts` | RGBずらし |
| `src/server/pixelImage/tvEffect/scanline.ts` | スキャンライン |
| `src/server/pixelImage/tvEffect/bloom.ts` | ブルーム |
| `src/server/pixelImage/tvEffect/colorAdjust.ts` | 色味、コントラスト補正 |
| `src/server/pixelImage/tvEffect/imageDataUtils.ts` | clamp、sample、copyなどの共通処理 |
| `src/components/molecules/TvEffectControls/index.tsx` | UIを分離する場合のコントロール |
| `tests/api/tvEffect.test.ts` | エフェクト関数、プリセット、Strengthのテスト |

MVPでファイル数を減らす場合の最小構成。

```text
src/server/pixelImage/tvEffect.ts
src/components/molecules/TvEffectControls/index.tsx
tests/api/tvEffect.test.ts
```

ただし、画像処理関数が増えるため、可読性を優先するならディレクトリ分割が望ましい。

変更候補。

| ファイル | 変更内容 |
| --- | --- |
| `src/pages/index.tsx` | TVエフェクト設定状態を持つ。API URLにクエリを追加する |
| `src/components/organisms/Form/index.tsx` | TV Effect UIを追加する。`handleImageUrl` にTV設定を渡す |
| `src/server/pixelImage/parser.ts` | TVエフェクト用クエリをパースする |
| `src/server/pixelImage/createImage.ts` | ドット絵生成後に `applyTvEffect` を呼ぶ |
| `tests/api/parser.test.ts` | TVエフェクトクエリのテストを追加する |
| `README.md` | APIパラメータにTVエフェクト設定を追記する |

`package.json` は原則変更しない。

### 7.5 データ構造・型定義案

`ParsedOptions` に直接フラットに大量の値を追加すると読みにくくなる。TVエフェクトはネストした構造にする。

```ts
export type TvEffectPreset =
  | "soft-tv"
  | "ntsc"
  | "crt"
  | "famicom-composite"
  | "sharp-emulator";

export type TvEffectParams = {
  horizontalBleed: number;
  bleedRadius: number;
  bleedStrength: number;
  chromaticAberration: number;
  redOffset: number;
  blueOffset: number;
  scanlineStrength: number;
  scanlineFrequency: number;
  scanlineThickness: number;
  bloomStrength: number;
  bloomThreshold: number;
  bloomRadius: number;
  saturation: number;
  contrast: number;
  gamma: number;
  brightness: number;
  blackLevel: number;
};

export type TvEffectOptions = {
  enabled: boolean;
  preset: TvEffectPreset;
  strength: number;
  params: TvEffectParams;
};
```

`ParsedOptions` は以下のように拡張する。

```ts
export type ParsedOptions = {
  image: string;
  type: OptionalType;
  size: number;
  k: number;
  tvEffect: TvEffectOptions;
};
```

UI側のフォーム状態は、API型と完全一致させなくてもよい。

```ts
export type ImageFormOptions = {
  imageUrl: string;
  cellSize: string;
  kSize: string;
  tvEffectEnabled: boolean;
  tvEffectPreset: TvEffectPreset;
  tvEffectStrength: string;
};
```

### 7.6 クエリパラメータ案

MVPではURLを短く保つ。

| query | 例 | 説明 |
| --- | --- | --- |
| `tv` | `1` | TVエフェクトON/OFF |
| `tvPreset` | `soft-tv` | プリセット |
| `tvStrength` | `60` | 0から100の一括強度 |

例。

```text
/api?image=...&size=15&k=8&tv=1&tvPreset=soft-tv&tvStrength=60
```

挙動。

- `tv` 未指定または `tv=0` は無効
- `tv=1` は有効
- `tvPreset` 未指定は `soft-tv`
- `tvPreset` 不正値は `soft-tv` にフォールバックする案、または parser方針に合わせてエラーにする案がある
- `tvStrength` 未指定は `60`
- `tvStrength` は `0 - 100` の整数

現行parserは不正な `size` / `k` をエラーにするため、`tvPreset` と `tvStrength` も不正値はエラーにする方が一貫する。ただしURL共有の壊れにくさを優先するなら、TV系だけフォールバックしてもよい。実装前に方針を確定する。

### 7.7 UI設計案

既存の `Form` に以下を追加する。

```text
TV Effect
  [ ] Enable TV Effect

Preset
  [soft-tv ▼]

Strength
  [------|---] 60
```

Tailwindの既存トーンに合わせる。

- ラベルは白文字
- 入力は既存の `Input` / `SizeInput` と近い高さにする
- 余白は既存の `mt-4`, `px-4`, `py-2` に合わせる
- 詳細UIはMVPでは未実装

`TvEffectControls` を分離する場合のprops。

```ts
type TvEffectControlsProps = {
  enabled: boolean;
  preset: TvEffectPreset;
  strength: string;
  onEnabledChange(enabled: boolean): void;
  onPresetChange(preset: TvEffectPreset): void;
  onStrengthChange(strength: string): void;
};
```

UI更新は、既存 `Form` と同じ1秒debounceに乗せる。

## 8. 詳細設計

### 8.1 エフェクト処理パイプライン

既存コードへ合わせると以下。

```text
1. 元画像を取得する
2. node-canvasへ元画像を描画する
3. 既存処理でセル単位の平均色を計算する
4. 既存処理で減色する
5. 既存処理でpixelCanvasへドット絵を描く
6. tvEffect.enabled が true の場合のみTVエフェクト処理へ進む
7. 横方向の色にじみを適用する
8. RGBチャンネルずらしを適用する
9. 明部ブルームを適用する
10. スキャンラインを適用する
11. 彩度、コントラスト、ガンマ、明るさ、黒レベルを調整する
12. pixelCanvasへ反映する
13. PNG/JPEGとして出力する
```

既存の `createImage` に入れる位置。

```text
for each cell:
  pixelCtx.fillRect(...)

ここで applyTvEffect を呼ぶ

if type === jpeg:
  pixelCanvas.toBuffer("image/jpeg")
else:
  pixelCanvas.toBuffer("image/png")
```

推奨関数境界。

```ts
applyTvEffect({
  ctx,
  width,
  height,
  params,
}): void
```

疑似コード。

```ts
export const applyTvEffect = (input: ApplyTvEffectInput): void => {
  const source = input.ctx.getImageData(0, 0, input.width, input.height);

  const bled = applyHorizontalBleed(source, input.params);
  const shifted = applyChromaticAberration(bled, input.params);
  const bloomed = applyBloom(shifted, input.params);
  const scanlined = applyScanline(bloomed, input.params);
  const adjusted = applyColorAdjust(scanlined, input.params);

  input.ctx.putImageData(adjusted, 0, 0);
};
```

### 8.2 パラメータ管理

パラメータ管理は3層に分ける。

UI層。

```text
enabled
preset
strength
```

parser層。

- `tv=1` のとき有効
- `tvPreset` を許可値として解釈する
- `tvStrength` を `0 - 100` の整数として解釈する
- 未指定なら `enabled: false`

effect層。

```text
baseParams = presets[preset]
params = applyStrength(baseParams, strength)
```

この変換は `presets.ts` に閉じ込める。

### 8.3 プリセット初期値案

デフォルト。

```ts
const defaultTvEffectOptions = {
  enabled: false,
  preset: "soft-tv",
  strength: 60,
};
```

エフェクト無効時は既存出力と同じになる必要がある。

プリセット値は以下を初期案とする。

| preset | bleed | radius | chromatic | scanline | bloom | saturation | contrast | gamma | brightness | blackLevel |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `soft-tv` | `0.35` | `1` | `0.12` | `0.10` | `0.06` | `1.04` | `1.03` | `1.00` | `1.00` | `0.00` |
| `ntsc` | `0.50` | `2` | `0.22` | `0.08` | `0.05` | `1.10` | `1.04` | `0.98` | `1.00` | `0.02` |
| `crt` | `0.30` | `1` | `0.16` | `0.18` | `0.10` | `1.06` | `1.08` | `1.02` | `0.98` | `0.03` |
| `famicom-composite` | `0.55` | `2` | `0.18` | `0.10` | `0.04` | `1.12` | `1.06` | `0.95` | `1.00` | `0.04` |
| `sharp-emulator` | `0.12` | `1` | `0.04` | `0.05` | `0.02` | `1.00` | `1.02` | `1.00` | `1.00` | `0.00` |

共通値。

- `redOffset`: `1`
- `blueOffset`: `-1`
- `scanlineFrequency`: `2`
- `scanlineThickness`: `1`
- `bloomThreshold`: `205 - 230`
- `bloomRadius`: `1 - 2`

Strengthは `0 - 100` で受け取り、内部では `0.0 - 1.0` に正規化する。

```text
normalizedStrength = clamp(tvStrength / 100, 0, 1)
```

反映対象。

- `horizontalBleed`
- `bleedStrength`
- `chromaticAberration`
- `scanlineStrength`
- `bloomStrength`

反映しない、または弱く反映する対象。

- `saturation`
- `contrast`
- `gamma`
- `brightness`
- `blackLevel`
- `scanlineFrequency`
- `bleedRadius`

## 9. テスト計画

### 9.1 単体テスト

このリポジトリにはすでに Vitest があるため、MVPでも単体テストを追加する。

対象。

| 対象 | テスト内容 |
| --- | --- |
| `isTvEffectPreset` | 不正なpresetを弾ける |
| `parseRequest` | `tv`, `tvPreset`, `tvStrength` をパースできる |
| `parseRequest` | 配列クエリ、不正strength、不正presetの扱い |
| `clamp` | 範囲制限が効く |
| `applyStrength` | Strengthが意図通り反映される |
| `applyHorizontalBleed` | 横方向だけ混ざる |
| `applyChromaticAberration` | R/Bが指定方向へずれる |
| `applyScanline` | 指定周期で暗くなる |
| `applyColorAdjust` | 値が0から255に収まる |

画像全体のスナップショット比較はMVPでは必須にしない。クラスタリングは決定的にしたうえで、まずは小さい `ImageData` 相当の配列に対する純粋関数テストを優先する。

### 9.2 表示確認

最低限、以下の画像で確認する。

- 小さいドット絵顔画像
- 高コントラスト画像
- 横長画像
- 縦長画像
- 小さい画像
- 大きい画像

重視点。

- 目の境界
- 口の境界
- 肌影
- 髪ハイライト
- 白黒境界でにじみすぎないか
- RGBズレが目立ちすぎないか
- スキャンラインで視認性が落ちすぎないか
- 非正方形画像で幅、高さを取り違えていないか
- APIレスポンス時間とメモリ使用量

### 9.3 エクスポート確認

確認項目。

- `tv` 未指定で既存出力と変わらない
- `tv=0` で既存出力と変わらない
- `tv=1` でTVエフェクトが反映される
- `tvPreset` を変えると見た目が変わる
- `tvStrength=0` では効果がほぼ消える
- `tvStrength=100` でも破綻しない
- `type=jpeg` で出力できる
- `type=png` で出力できる
- Web UIのプレビュー画像を保存した結果とAPI直接アクセス結果が一致する

### 9.4 回帰確認

既存機能の回帰確認。

- `image` のみ指定したURLが動く
- `size` を変えるとセルサイズが変わる
- `k` を変えると色数が変わる
- README記載の既存URLが壊れない
- TVエフェクト未指定時に既存挙動が維持される
- `npm run typecheck` が通る
- `npm run lint` が通る
- `npm run test` が通る
- `npm run build` が通る

### 9.5 パフォーマンス確認

計測対象。

- `createImage` 全体の処理時間
- TVエフェクトON/OFFでの差分
- `soft-tv`, `ntsc`, `crt` それぞれの差分
- bloomあり/なしの差分
- 大きい画像でのメモリ使用量

目安。

- 小さい画像では体感差が少ない
- 中サイズ画像でも数秒以内
- 大サイズ画像でタイムアウトしそうなら、MVPでは自動的にbloomを弱める、または無効化する

## 10. 実装ステップ

### Step 1: 設計書を追加する

対象。

```text
docs/tv-effect-implementation-plan.md
```

### Step 2: TVエフェクト型を追加する

対象候補。

```text
src/server/pixelImage/tvEffect/types.ts
```

実施内容。

- `TvEffectPreset`
- `TvEffectParams`
- `TvEffectOptions`
- `DEFAULT_TV_EFFECT_OPTIONS`

を定義する。

### Step 3: プリセットを追加する

対象候補。

```text
src/server/pixelImage/tvEffect/presets.ts
```

実施内容。

- `soft-tv`
- `ntsc`
- `crt`
- `famicom-composite`
- `sharp-emulator`
- `isTvEffectPreset`
- `resolveTvEffectParams`
- `applyStrengthToPreset`

を定義する。

### Step 4: parserを拡張する

対象。

```text
src/server/pixelImage/parser.ts
tests/api/parser.test.ts
```

実施内容。

- `tv`
- `tvPreset`
- `tvStrength`

を読む。

挙動。

- 未指定なら `enabled: false`
- `tv=1` のときだけ有効
- `tv=0` は無効
- `tvPreset` は許可値のみ受け取る
- `tvStrength` は `0 - 100` の整数
- 既存の `image`, `size`, `k`, `type` の挙動を変えない

### Step 5: エフェクト統合関数を追加する

対象候補。

```text
src/server/pixelImage/tvEffect/applyTvEffect.ts
```

実施内容。

- `ctx`, `width`, `height`, `params` を受け取る
- `getImageData` で画素を取得する
- 各エフェクト関数を順に呼ぶ
- 最後に `putImageData` で反映する

### Step 6: 横方向の色にじみを実装する

対象候補。

```text
src/server/pixelImage/tvEffect/horizontalBleed.ts
```

実施内容。

- 横方向のみ参照する
- 縦方向には混ぜない
- alphaを壊さない
- 端のピクセルはclampして参照する

### Step 7: RGBチャンネルずらしを実装する

対象候補。

```text
src/server/pixelImage/tvEffect/chromaticAberration.ts
```

実施内容。

- R/G/Bを別サンプル位置から取る
- Gは基準位置
- RとBは横方向へずらす
- `chromaticAberration` で元画像とのmix率を調整する

### Step 8: ブルームを実装する

対象候補。

```text
src/server/pixelImage/tvEffect/bloom.ts
```

実施内容。

- 輝度で明部を抽出する
- 小半径でぼかす
- 元画像に加算合成する
- 値は0から255にclampする

### Step 9: スキャンラインを実装する

対象候補。

```text
src/server/pixelImage/tvEffect/scanline.ts
```

実施内容。

- y座標に応じてRGBを暗くする
- `scanlineFrequency`
- `scanlineThickness`
- `scanlineStrength`

を使う。

### Step 10: 色味補正を実装する

対象候補。

```text
src/server/pixelImage/tvEffect/colorAdjust.ts
```

実施内容。

- brightness
- contrast
- saturation
- gamma
- blackLevel

を適用する。

### Step 11: `createImage` へ接続する

対象。

```text
src/server/pixelImage/createImage.ts
```

実施内容。

- ドット絵描画後に `tvEffect.enabled` を確認する
- 有効なら `applyTvEffect` を呼ぶ
- 出力処理は既存の `toBuffer` を維持する

注意点。

- エフェクト無効時は既存出力を変えない
- 出力形式の分岐は既存のまま
- 非正方形画像の修正済み幅、高さを使う

### Step 12: UIへ接続する

対象。

```text
src/pages/index.tsx
src/components/organisms/Form/index.tsx
src/components/molecules/TvEffectControls/index.tsx
```

実施内容。

- UI stateを追加する
- `handleImageUrl` にTVエフェクト設定を渡す
- URLクエリに `tv`, `tvPreset`, `tvStrength` を追加する
- `Form` にON/OFF、Preset、Strengthを追加する
- 既存の1秒debounceに乗せる

MVPではAdvanced Settingsは実装しない。

### Step 13: READMEを更新する

対象。

```text
README.md
```

実施内容。

- ConfigにTVエフェクト用クエリを追記する
- プリセット一覧を書く
- `tv=1` のサンプルURLを追加する

### Step 14: 動作確認する

実施内容。

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run dev`
- API直接確認
- Web UI確認
- 画像保存確認

## 11. リスクと対策

| リスク | 対策 |
| --- | --- |
| 横にじみが単なるぼかしに見える | 縦方向ブラーは入れず、横方向を主役にする |
| RGBずらしがグリッチ風になりすぎる | 初期値を控えめにし、mix率で制御する |
| スキャンラインで暗くなりすぎる | 初期値は `0.10 - 0.18` 程度にし、上限を設ける |
| ブルームでドット絵が潰れる | thresholdを高め、strengthとradiusを小さくする |
| 処理が重くなる | ImageDataの取得と反映を最小化し、横ブラーを1Dに限定する |
| キャッシュと揺らぎ表現が衝突する | MVPではランダムノイズを入れない |
| 既存API互換性を壊す | `tv` 未指定時、`tv=0` は既存挙動を維持する |
| 非正方形画像の既存問題と混ざる | TVエフェクト実装前に出力サイズ修正とテストを完了する |

## 12. 将来拡張案

### 12.1 Advanced Settings UI

将来追加するUI。

```text
Advanced Settings
  横にじみ
    bleedStrength
    bleedRadius

  RGBずらし
    chromaticAberration
    redOffset
    blueOffset

  スキャンライン
    scanlineStrength
    scanlineFrequency
    scanlineThickness

  ブルーム
    bloomStrength
    bloomThreshold
    bloomRadius

  色味
    saturation
    contrast
    gamma
    brightness
    blackLevel
```

### 12.2 WebGLプレビュー

API出力はCanvas 2Dのまま、ブラウザプレビューだけWebGLにする案。リアルタイム調整には有効だが、API出力との一致問題が出るため、Canvas 2D版を正とし、WebGL版は近似プレビューとして扱う。

### 12.3 NTSC/YIQベースの色処理

より本格的なNTSC再現として、RGBをYIQやYCbCrに変換し、chroma成分だけ横方向にぼかす案。MVPでは複雑なため入れない。

### 12.4 phosphor mask / curvature / vignette

CRTのサブピクセル、蛍光体パターン、画面湾曲、周辺減光を加える案。MVPでは入れない。

### 12.5 seed付きノイズ

FC互換機やTV差を揺らぎとして出す場合、ランダムではなくseed付きにする。

```text
tvNoise=0.1
tvSeed=1234
```

MVPでは入れない。

### 12.6 Export UI

将来、以下を追加できる。

- Download PNG
- Download JPEG
- Copy Markdown
- Copy API URL
- Compare before/after

現状はAPI画像URLが実質エクスポート手段のため、MVPでは不要。

## 13. 実装前の確認事項

1. TVエフェクトはAPI利用者にも公開する機能か、Web UI専用か
2. `tv=1` のような短いクエリ名でよいか、`tvEffect=1` にするか
3. デフォルトではTVエフェクトOFFでよいか
4. MVPのデフォルトプリセットは `soft-tv` でよいか
5. Strength初期値は60でよいか
6. 不正な `tvPreset` / `tvStrength` はフォールバックかエラーか
7. `warm-tv` / `cool-tv` もMVPに入れるか
8. 非正方形画像の既存サイズ問題をTVエフェクト前に直すか
9. エフェクトの名称をUI上で `TV Effect`, `CRT/TV Effect`, `NTSC TV Effect` のどれにするか

推奨回答。

- APIにも公開する
- クエリ名は `tv`, `tvPreset`, `tvStrength`
- デフォルトはOFF
- デフォルトプリセットは `soft-tv`
- Strength初期値は60
- 不正値は現行parserに合わせてエラー
- `warm-tv` / `cool-tv` はMVPでは入れない
- 非正方形画像修正はTVエフェクト前に実施する
- UI名は `TV Effect`

## 14. 最初のPRでやるべき範囲

API側。

- TVエフェクト型追加
- プリセット追加
- `parseRequest` 拡張
- `createImage` への接続
- Canvas 2Dベースのポストプロセス追加
- 横方向にじみ
- RGBずらし
- スキャンライン
- 弱いブルーム
- 色味補正

UI側。

- TV Effect ON/OFF
- Preset選択
- Strength調整
- API URLへのクエリ追加

ドキュメント。

- READMEのConfig追記
- `docs/tv-effect-implementation-plan.md` の追加

確認。

- 既存URLの互換性
- `tv=1` の動作
- `soft-tv` の見た目
- 目、口周りの見え方
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

## 15. 2本目以降のPRに分けるべき範囲

PR 2: 調整UI。

- Advanced Settings
- 横にじみ詳細
- RGBずらし詳細
- スキャンライン詳細
- ブルーム詳細
- 色味補正詳細

PR 3: 品質改善。

- 最大出力ピクセル数制限
- パフォーマンス計測
- エラーメッセージのUI表示

PR 4: 高度な表示再現。

- YIQ/YCbCrベースのchroma bleed
- phosphor mask
- curvature
- vignette
- seed付きノイズ
- WebGLプレビュー

## 16. 実装タスクチェックリスト

### 調査・設計

- [ ] 既存の画像生成フローを再確認する
- [ ] MVPのプリセット名を確定する
- [ ] UI表示名を確定する
- [ ] クエリ名を確定する
- [ ] 不正値をエラーにするかフォールバックにするか確定する

### 型・パラメータ

- [ ] `TvEffectPreset` を定義する
- [ ] `TvEffectParams` を定義する
- [ ] `TvEffectOptions` を定義する
- [ ] デフォルト値を定義する
- [ ] プリセット値を定義する
- [ ] Strength反映ロジックを定義する

### API parser

- [ ] `tv` をパースする
- [ ] `tvPreset` をパースする
- [ ] `tvStrength` をパースする
- [ ] 不正値の扱いをテストする
- [ ] 未指定時に既存挙動を保つ

### 画像処理

- [ ] `applyTvEffect` を追加する
- [ ] 横方向の色にじみを追加する
- [ ] RGBチャンネルずらしを追加する
- [ ] ブルームを追加する
- [ ] スキャンラインを追加する
- [ ] 色味、コントラスト補正を追加する
- [ ] clamp処理を共通化する
- [ ] alphaを壊さないことを確認する

### 既存処理への接続

- [ ] `createImage` のドット絵生成後に接続する
- [ ] `tvEffect.enabled` がfalseなら処理しない
- [ ] PNG出力を確認する
- [ ] JPEG出力を確認する

### UI

- [ ] `Form` にTV Effect ON/OFFを追加する
- [ ] Preset selectを追加する
- [ ] Strength inputを追加する
- [ ] `index.tsx` のURL生成にTVクエリを追加する
- [ ] 既存の1秒debounceに乗せる
- [ ] Advanced SettingsはMVPでは出さない

### ドキュメント

- [ ] READMEに `tv` を追記する
- [ ] READMEに `tvPreset` を追記する
- [ ] READMEに `tvStrength` を追記する
- [ ] サンプルURLを追加する
- [ ] プリセット一覧を追記する

### 表示確認

- [ ] 小さいドット絵顔画像で確認する
- [ ] 目周りを確認する
- [ ] 口周りを確認する
- [ ] 肌影を確認する
- [ ] 髪ハイライトを確認する
- [ ] 高コントラスト画像で確認する
- [ ] 横長画像で確認する
- [ ] 縦長画像で確認する
- [ ] 大きい画像で確認する

### 回帰確認

- [ ] 既存READMEのサンプルURLが動く
- [ ] `tv` 未指定で既存出力と同じ
- [ ] `tv=0` で既存出力と同じ
- [ ] `tv=1` で効果が出る
- [ ] presetごとの差が分かる
- [ ] strength 0で効果がほぼ消える
- [ ] strength 100で破綻しない
- [ ] `npm run typecheck` が通る
- [ ] `npm run lint` が通る
- [ ] `npm run test` が通る
- [ ] `npm run build` が通る

## 17. 結論

MVPでは、既存のAPI側画像生成フローに沿って、node-canvas / Canvas 2D のポストプロセスとしてTV表示再現エフェクトを追加するのが最も安全である。

現在のWeb UIはAPI画像URLをそのままプレビューしているため、API側でエフェクトを焼き込むことで、プレビューと保存結果の一致を保てる。

最初のPRでは、UIを `ON/OFF`、`Preset`、`Strength` に絞り、実装範囲を小さく保つ。高度なCRT表現、WebGL、Advanced Settings、ノイズ、phosphor maskなどは2本目以降のPRに分ける。

最重要の見た目は横方向の色にじみである。実装後の確認では、目、口、肌影、髪ハイライトの境界が自然に見えるかを最優先で評価する。
