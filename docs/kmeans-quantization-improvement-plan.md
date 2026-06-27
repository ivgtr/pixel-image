# K-means / 減色処理改善計画

## 目的

`pixel-image` の画像変換品質を安定させるため、K-means 周辺の減色処理を段階的に改善する。

現在の API / Web UI は、画像 URL と `size` / `k` を受け取り、画像をセル単位に平均化したあと、K-means によって色数を削減してドット絵風画像を生成している。

ただし、`Cell-Size` や `K-Size` を 1 段階変えただけで結果が大きく変わるケースがある。これは単一の UI 問題ではなく、以下の処理が密結合していることに起因する。

- セル分割粒度
- セル内の代表色算出
- 減色用データの並び順
- K-means の初期セントロイド選択
- RGB 距離によるクラスタリング
- 出力時のドットサイズ

本計画では、後方互換性を保ちながら、減色処理の安定性・画質・拡張性を上げる実装方針を整理する。

## 現在の処理フロー

現行の主な処理は `src/server/pixelImage/createImage.ts` と `src/server/pixelImage/cluster.ts` に分かれている。

概略は以下。

1. `analyzeImage(image)` でリモート画像を取得する
2. `canvas` に元画像を描画する
3. `size` を使って画像をセルに分割する
4. 各セル内の RGB 平均値を `rgbArray` に格納する
5. `cluster(rgbArray, k)` で K-means 減色を行う
6. 減色後の色でセルを塗りつぶす
7. 必要なら TV 表示再現エフェクトを適用する
8. PNG / JPEG として返す

この構成では、`size` が以下を同時に決めている。

- 代表色を抽出するサンプリング粒度
- 出力時の 1 ドットの描画サイズ
- 出力キャンバスの寸法

そのため、ユーザーが「ドットの大きさを少し変えた」つもりでも、内部では減色対象の入力データ自体が大きく変わる。

## 既知の課題

### 1. K-means の入力がセル配列順序に依存している

K-means は初期セントロイドに強く依存する。

従来実装では、flatten された `rgbArray` の等間隔位置から初期セントロイドを選んでいたため、同じ色分布でもセルの並び順が変わるだけで結果が変わり得る。

`Cell-Size` を変更すると、セル数・端セル・走査順上の位置が変わるため、初期セントロイドも変わる。

### 2. `K-Size` の 1 段階変更で全体が再最適化される

K-means は `k=4` と `k=5` を別問題として解く。

そのため、ユーザーの期待する「色を 1 つ増やす」と、実際の「クラスタ全体を再計算する」の間に差がある。

これは K-means の性質であり、完全には避けられない。ただし、初期化・パレット生成方針・階層的減色によって違和感を減らせる。

### 3. RGB 空間上の距離が見た目と一致しづらい

現在の距離計算は RGB の二乗距離である。

これは単純で高速だが、人間の知覚上の近さとはズレる。特に肌色、暗部、青〜紫、彩度差のある色で不自然なクラスタリングが発生しやすい。

### 4. セル平均が輪郭をにじませる

現在はセル内の RGB を単純平均している。

写真では自然に見える場合があるが、線画・アイコン・顔グラ・ドット絵素材では、輪郭や目口などの重要な小領域が平均化で失われやすい。

### 5. API パラメータ名と内部意味が一致していない

UI 上の `Cell-Size` は、実際には「セル分割」「描画サイズ」「出力サイズ」を同時に意味している。

`K-Size` も、一般ユーザーにとっては意味が伝わりづらい。UI では `Colors` または `Palette Size` の方が自然である。

## 改善方針

### 方針 A: 後方互換性を優先する

既存の API 利用者を壊さないため、当面は以下を維持する。

- `size`
- `k`
- `tv`
- `tvPreset`
- `tvStrength`

新しいパラメータを追加する場合も、既存パラメータの意味は急に変更しない。

### 方針 B: 減色処理を独立した責務として分離する

現在は `createImage.ts` の中で、セル平均化・減色・描画が連続している。

今後は以下のように責務を分ける。

```text
createImage.ts
  ├─ 入出力と canvas 制御
  ├─ セル分割
  ├─ representative color extraction
  ├─ quantization
  └─ rendering
```

候補ファイル構成。

```text
src/server/pixelImage/
  createImage.ts
  quantize/
    index.ts
    kMeans.ts
    colorBucket.ts
    colorDistance.ts
    palette.ts
  sampling/
    averageCellColor.ts
    dominantCellColor.ts
```

ただし、初回 PR では大規模分割を避ける。まずは `cluster.ts` 周辺に閉じた変更から始める。

### 方針 C: 画質改善と UX 改善を分離する

K-means の安定化、色空間の改善、UI ラベル変更、Dithering 追加は別 PR に分ける。

1 つの PR で複数の見た目変化を入れると、レビュー時に原因を追いづらくなるため。

## Phase 1: Weighted color histogram quantization

### 目的

セルごとの RGB 配列を直接 K-means するのではなく、同一色をまとめた `ColorBucket` に対して weighted K-means を行う。

### 現在

```ts
const { clusters, mat } = cluster(rgbArray, k);
```

`rgbArray` はセル数と同じ長さを持つ。重複色が多い場合でも、同じ色が何度も距離計算される。

### 改善後

```ts
type ColorBucket = {
  color: [number, number, number];
  count: number;
};
```

同じ色を bucket にまとめ、クラスタ更新時に `count` を重みとして扱う。

### 期待効果

- 同じ色分布ならセル順序に依存しにくくなる
- 大きい画像や `size=1` の処理負荷を下げられる
- 将来の palette 表示や dominant color 抽出に流用しやすい

### 実装メモ

- `rgbArray` から `ColorBucket[]` を生成する
- centroid assignment は bucket 単位で行う
- centroid update は `count` 重み付き平均で行う
- 最終的に元の `rgbArray` 各要素を最近傍 centroid に割り当てる
- `k > uniqueColorCount` の場合は unique colors を上限にする

### テスト観点

- 同じ色分布で順序が異なる場合に同一 palette になる
- `k` が unique color 数を超えてもエラーにならない
- `size=1` の画像でも deterministic に動作する
- 既存の `createImage` 出力寸法テストが維持される

## Phase 2: パレット安定性の改善

### 目的

`K-Size` を 1 変えたとき、既存の主要色が大きく入れ替わる違和感を減らす。

### 候補 1: Bisecting K-means

分散が最大のクラスタを 1 つずつ分割し、`k` 個の palette を作る。

メリット。

- `k=4` から `k=5` への変化が局所的になりやすい
- 「色を 1 つ追加する」という UI 感覚に近い

デメリット。

- 通常の K-means より実装が増える
- 最終 palette が必ずしも全体最適ではない

### 候補 2: Ordered palette generation

内部では最大 `k` まで palette を順序付きで生成し、指定された `k` 個だけを使う。

メリット。

- `k` 変更時の差分が安定しやすい
- palette 表示 UI と相性がよい

デメリット。

- 低 `k` に最適化された palette ではなくなる可能性がある

### 推奨

まずは Phase 1 の weighted K-means を入れたあと、実画像でまだ `K-Size` 変化の違和感が大きい場合に Bisecting K-means を検討する。

## Phase 3: 色距離の改善

### 目的

RGB ユークリッド距離による減色を、人間の見た目に近い距離へ改善する。

### 候補

| mode | 内容 | 実装コスト | 備考 |
| --- | --- | --- | --- |
| `rgb` | 現行互換 | 低 | default として維持 |
| `linear-rgb` | sRGB を線形化して平均・距離計算 | 中 | 自然な平均色になりやすい |
| `yiq` / `ycbcr` | 輝度と色差を分ける | 中 | TV/NTSC 風と相性がよい |
| `oklab` | 知覚寄りの色空間 | 中〜高 | 減色品質が上がりやすい |

### API 案

```text
colorSpace=rgb | linear-rgb | ycbcr | oklab
```

初期導入では API に露出せず、内部関数として `rgb` と `linear-rgb` を比較できるようにする程度でよい。

## Phase 4: セル代表色の抽出モード追加

### 目的

セル平均だけではなく、画像種別に応じた代表色抽出を選べるようにする。

### 候補

| mode | 内容 | 向いている画像 |
| --- | --- | --- |
| `average` | セル内の平均色 | 写真、滑らかな画像 |
| `center` | セル中央の色 | 既存ドット絵、アイコン |
| `dominant` | セル内で最も支配的な色 | 線画、顔グラ、低色数画像 |

### API 案

```text
sampleMode=average | center | dominant
```

後方互換のため default は `average` とする。

## Phase 5: Dithering の追加

### 目的

低色数でも階調や中間色を表現しやすくする。

特に TV 表示再現エフェクトと組み合わせる場合、Dithering によって「少ない色数なのに多色に見える」表現が可能になる。

### 候補

| mode | 特徴 |
| --- | --- |
| `none` | 現行互換 |
| `ordered` | 規則的な網点。ドット絵と相性がよい |
| `bayer2x2` | 小さいパターンで低解像度向き |
| `bayer4x4` | 滑らかさとパターン感のバランスがよい |
| `floyd-steinberg` | 写真向き。ドット絵ではノイズ感が出る場合がある |

### API 案

```text
dither=none | ordered | bayer2x2 | bayer4x4 | floyd-steinberg
```

導入時は `none` default とする。

## Phase 6: UI / API の意味整理

### UI ラベル改善

現在の UI ラベルは以下。

- `Cell-Size`
- `K-Size`

改善案。

- `Cell-Size` → `Pixel Size` または `Block Size`
- `K-Size` → `Colors` または `Palette Size`

API パラメータの `size` / `k` は後方互換のため維持する。

### 将来的な API 分離案

`size` が複数の意味を持っているため、将来的には以下のように分離する。

| parameter | 意味 |
| --- | --- |
| `sampleSize` | 元画像を何 px 単位で代表色化するか |
| `pixelSize` | 出力時に 1 ドットを何 px で描画するか |
| `outputScale` | 出力全体の拡大倍率 |
| `fit` | 元画像サイズ維持か、セル境界に合わせるか |

互換性維持のため、当面は以下のように扱う。

```text
sampleSize = size
pixelSize = size
```

## 推奨 PR 分割

### PR 1: Weighted color histogram quantization

目的。

- K-means 本体を weighted bucket ベースにする
- 順序依存をさらに減らす
- パフォーマンスを改善する

含める変更。

- `ColorBucket` の導入
- bucket 単位の assignment / update
- `cluster.test.ts` の追加・拡張

含めない変更。

- UI ラベル変更
- 色空間変更
- Dithering

### PR 2: Quantization module split

目的。

- `cluster.ts` の責務を分ける
- 今後の色空間・Dithering 追加を容易にする

含める変更。

- `quantize/` ディレクトリの作成
- `kMeans.ts`, `colorBucket.ts`, `colorDistance.ts` への分離
- 既存 API 挙動は維持

### PR 3: UI labels for pixel and palette controls

目的。

- ユーザーが操作の意味を理解しやすくする

含める変更。

- `Cell-Size` ラベル変更
- `K-Size` ラベル変更
- 必要なら README の説明更新

### PR 4: Sampling mode

目的。

- 画像種別に応じた代表色抽出を可能にする

含める変更。

- `sampleMode` parser 追加
- `average`, `center`, `dominant` 実装
- parser / createImage テスト追加

### PR 5: Dithering options

目的。

- 少ない色数での表現力を上げる

含める変更。

- `dither` parser 追加
- `ordered` / `bayer4x4` から実装
- README に例を追加

## 非目標

以下は本計画の初期範囲には含めない。

- WebAssembly 化
- GPU / WebGL 処理
- ブラウザ側でのリアルタイム処理移行
- 画像編集 UI の大幅刷新
- パレット手動編集 UI
- 外部画像ライブラリへの全面置換

これらは、減色処理の責務分離が完了した後に検討する。

## 実装時の注意点

- API の既存パラメータを壊さない
- `size` / `k` の default を変更しない
- TV 表示再現エフェクトは減色後の後処理として維持する
- 画像 URL 取得周りのセキュリティ制約は変更しない
- 見た目が変わる変更は PR ごとに分ける
- テストではネットワークアクセスを避ける

## 完了条件

短期的には以下を満たすことを目標にする。

- `Cell-Size` を 1 変えた場合の意図しないパレット崩壊が減る
- `K-Size` を 1 変えた場合の主要色消失が減る
- 同じ色分布ならセル順序が変わっても同じ palette になる
- 減色処理の責務が分離され、今後の色空間・Dithering 追加が容易になる
- 既存 API 利用者に破壊的変更を与えない
