# LessonMap MVP 実装計画

**Goal:** 大津市の習い事データをもとに、曜日・時間・対象年齢で絞り込める地図検索MVPを最短で作り親ユーザーへのフィードバック収集を可能にする

**Architecture:** Next.js App Router + API Routes でフロントとバックエンドを一体化。DBは不使用でローカルJSONを直接読み込む。地図はLeafletを採用（MapLibreより導入が軽量でMVP向き）。

**Tech Stack:** Next.js 14 / TypeScript / Tailwind CSS / Leaflet + React-Leaflet / next/server API Routes

---

## フェーズ分割

| Phase | 目的 | 成果物 |
|-------|------|--------|
| Phase 0 | 画面設計 | `docs/wireframes.md` |
| Phase 1 | 地図＋マーカー表示 | localhost で教室マーカーが見える |
| Phase 2 | カテゴリ・年齢フィルタ | サイドバーUIで絞り込み可能 |
| Phase 3 | 曜日・時間フィルタ ＋ データ品質表示 | LessonMap差別化機能が動く |
| Phase 4 | UX改善・レスポンシブ・詳細画面 | 親に見せられるレベル |

---

## 技術選定理由

### Next.js 14 (App Router)
- API Routes でJSONデータをサーブできるため別途バックエンド不要
- MVPで必要な SSR/CSR の切り替えが容易

### TypeScript
- 教室データのスキーマを型定義することでデータ不整合を早期に検出

### Tailwind CSS
- ユーティリティファーストでUI試行錯誤が速い。設計変更コストが低い

### Leaflet (react-leaflet)
- OSM ベースで無料・APIキー不要
- MapLibre より設定が少なくMVPに最適
- マーカーカスタマイズ・ポップアップが豊富

### JSONファイル直読み（DB不使用）
- セットアップゼロ。将来Supabase等に移行しやすいAPI設計にしておく

---

## ディレクトリ構成

```
lesson-map/
├── data/                          # 既存の習い事JSONデータ
│   ├── otsu_soccer_schools.json
│   ├── otsu_swimming.json
│   ├── otsu_dance.json
│   ├── otsu_gymnastics.json
│   ├── otsu_english.json
│   ├── otsu_juku.json
│   ├── otsu_piano.json
│   └── otsu_programming.json
├── docs/
│   ├── implementation-plan.md     # 本ファイル
│   └── wireframes.md              # Phase 0 成果物
├── src/
│   ├── app/
│   │   ├── layout.tsx             # ルートレイアウト
│   │   ├── page.tsx               # トップページ（地図検索画面）
│   │   └── api/
│   │       └── lessons/
│   │           └── route.ts       # GET /api/lessons → JSONを返す
│   ├── components/
│   │   ├── Map/
│   │   │   ├── MapView.tsx        # Leaflet地図本体（SSR無効化）
│   │   │   ├── LessonMarker.tsx   # マーカー1個分のコンポーネント
│   │   │   └── MarkerPopup.tsx    # クリック時ポップアップ
│   │   ├── Sidebar/
│   │   │   ├── FilterPanel.tsx    # フィルタUI全体
│   │   │   ├── CategoryFilter.tsx # カテゴリチェックボックス
│   │   │   ├── AgeFilter.tsx      # 対象年齢セレクト
│   │   │   ├── WeekdayFilter.tsx  # 曜日チェックボックス（Phase 3）
│   │   │   └── TimeFilter.tsx     # 時間帯スライダー（Phase 3）
│   │   ├── LessonCard.tsx         # サイドバー教室カード
│   │   └── DataQualityBadge.tsx   # high/medium/low バッジ（Phase 3）
│   ├── lib/
│   │   ├── loadLessons.ts         # JSONファイル統合読み込み
│   │   ├── filterLessons.ts       # フィルタロジック（純粋関数）
│   │   └── dataQuality.ts         # データ品質判定ロジック（Phase 3）
│   └── types/
│       └── lesson.ts              # Lesson型・FilterState型定義
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## データスキーマ（型定義）

```typescript
// src/types/lesson.ts
export type DataQuality = 'high' | 'medium' | 'low'

export type Schedule = {
  weekday: string | null
  start_time: string | null
  end_time: string | null
}

export type Lesson = {
  name: string
  category: string
  address: string | null
  website: string | null
  phone: string | null
  target_age: string | null
  schedules: Schedule[]
  price: string | null
  source_url: string
  organization_type: string
  // 緯度経度（Geocoding後に付加 or 手動付与）
  lat?: number
  lng?: number
  // 品質スコア（Phase 3で付加）
  data_quality?: DataQuality
}

export type FilterState = {
  categories: string[]
  weekdays: string[]
  timeStart: string | null  // "16:00"
  timeEnd: string | null    // "18:00"
  targetAge: string | null
}
```

---

## 緯度経度について（重要リスク）

JSONデータに緯度経度が含まれていない。以下の方針で対応：

**Phase 1 での対応：**
- 住所が取得できている教室のみ表示対象
- Nominatim（OpenStreetMap無料ジオコーダー）でビルド時にバッチ変換
- 変換結果を `data/otsu_lessons_with_coords.json` として保存
- APIレート制限（1req/sec）に注意

**Phase 1 の暫定策（最速）：**
- 代表座標（大津市役所付近: 35.0045, 135.8686）に全マーカーを表示
- Phase 1 完了後、ジオコーディングバッチを別途実行

---

## 想定リスク

| リスク | 影響 | 対策 |
|--------|------|------|
| 緯度経度データなし | 地図表示ができない | Nominatim でバッチジオコーディング |
| Leaflet の SSR 問題 | Next.js でビルドエラー | `dynamic(() => import(...), { ssr: false })` で回避 |
| 住所が null の教室 | マーカー表示できない | 住所nullは地図から除外、リストには表示 |
| JSONデータの不整合 | 型エラー | Zod等で検証 or 防御的な型ガードで対応 |
| フィルタ条件「曜日null」の扱い | 絞り込み結果が空になる | low品質教室は絞り込みから外れず「別扱い」で表示 |

---

## 各フェーズ詳細タスク

### Phase 0: 画面設計
- [ ] `docs/wireframes.md` 作成（ASCIIワイヤーフレーム）
- [ ] git commit: `Phase 0: Create wireframes`

### Phase 1: 地図＋マーカー表示
- [ ] `npx create-next-app@latest` でプロジェクト初期化
- [ ] Leaflet, react-leaflet インストール
- [ ] `src/types/lesson.ts` 作成
- [ ] `src/lib/loadLessons.ts` 作成（全JSONを統合読み込み）
- [ ] `app/api/lessons/route.ts` 作成
- [ ] Nominatim バッチジオコーディングスクリプト作成・実行
- [ ] `MapView.tsx` 作成（SSR無効化）
- [ ] `LessonMarker.tsx` + `MarkerPopup.tsx` 作成
- [ ] `app/page.tsx` に地図を配置
- [ ] `npm run dev` で動作確認
- [ ] git commit: `Phase 1: Setup map and markers`

### Phase 2: カテゴリ・年齢フィルタ
- [ ] `FilterPanel.tsx`, `CategoryFilter.tsx`, `AgeFilter.tsx` 作成
- [ ] `filterLessons.ts` にカテゴリ・年齢フィルタ実装
- [ ] `LessonCard.tsx` 作成
- [ ] サイドバーUI組み込み
- [ ] 地図マーカー・カード件数連動
- [ ] git commit: `Phase 2: Add category filters`

### Phase 3: 曜日・時間フィルタ＋データ品質
- [ ] `dataQuality.ts` 実装（high/medium/low 判定）
- [ ] `WeekdayFilter.tsx`, `TimeFilter.tsx` 作成
- [ ] マーカー色をデータ品質で変更（緑/黄/灰）
- [ ] `DataQualityBadge.tsx` 作成
- [ ] フィルタ時の low品質教室の扱い実装
- [ ] git commit: `Phase 3: Add schedule filtering`

### Phase 4: UX改善
- [ ] レスポンシブ対応（モバイル）
- [ ] 地図クリック↔カードのハイライト連動
- [ ] 教室詳細モーダル/ページ
- [ ] 公式サイトリンク表示
- [ ] ローディング・エラーUI
- [ ] git commit: `Phase 4: Improve UX`
