# LessonMap

大津市の習い事を曜日・時間・対象年齢で探せる地図検索サービスのMVP。

## セットアップ

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) で起動します。

> **必要なNodeバージョン:** v20以上  
> nvmを使っている場合: `nvm use 20`

## データ

`data/` ディレクトリに大津市の習い事データ（8カテゴリ・107教室）が収録されています。  
緯度経度付きデータは `data/otsu_lessons_with_coords.json` です。

ジオコーディングを再実行する場合:

```bash
node scripts/geocode.mjs   # Nominatimで住所→緯度経度変換（1req/sec）
node scripts/geocode2.mjs  # エリア座標で補完
```

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Leaflet / react-leaflet (地図)
- OpenStreetMap (タイル)