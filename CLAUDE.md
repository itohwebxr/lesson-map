# CLAUDE.md — Claude Code 操作ルール

このファイルはClaude Codeがこのリポジトリを操作する際に従うルールを定義する。

---

## プロジェクト概要

**LessonMap** — 子ども向け習い事教室の地図検索アプリ。  
Next.js (App Router) + TypeScript + Leaflet + JSON データファイル構成。

---

## ブランチ運用

- 開発ブランチ: `claude/practical-lamport-Wztcz`
- mainブランチへの直接プッシュは禁止
- プルリクエストはユーザーの明示的な指示がある場合のみ作成する

---

## データ操作ルール

### 最重要: data/otsu_lessons_with_coords.json

- 収集・更新ルールの詳細は `docs/data-collection-rules.md` を参照すること
- **推測値を登録しない**: 確認できる情報のみ保存する
- **既存値を上書きしない**: すでに値があるフィールドは保持する
- **番地なし住所には座標を付与しない**: `lat` / `lng` は `null` のままにする
- 施設名から住所を引く場合は Google Places API で検索する（ウェブ検索スニペットは使わない）
- 新規レコード追加時は重複チェックを行う（教室名の完全一致）

### ジオコーディング

```bash
GOOGLE_MAPS_API_KEY=<key> node scripts/geocode_google.mjs
```

新規レコードのジオコーディングには `scripts/geocode_google.mjs` を使用する。  
番地のない住所はジオコーディング対象外（スキップされる）。

---

## コーディングルール

- TypeScriptの型エラーを出したままコミットしない
- コミット前に `npm run build` が通ることを確認する
- コメントは「なぜ」が非自明な場合のみ記載する（何をしているかは書かない）
- 新規ファイル作成より既存ファイルの編集を優先する

---

## Git ルール

- コミットメッセージは英語で簡潔に記載する
- 各コミットの末尾にセッションURLを含める
- トークン・APIキー等の秘密情報をコミットしない
- `.git/config` のリモートURLにトークンを含めない（プッシュ後すぐにURLを元に戻す）

---

## ディレクトリ構成

```
lesson-map/
├── data/
│   └── otsu_lessons_with_coords.json   # メインデータ（全教室）
├── docs/
│   ├── data-collection-rules.md        # データ収集ルール（必読）
│   ├── data-expansion-report.md        # データ拡張レポート
│   ├── category-gap-analysis.md        # カテゴリ別ギャップ分析
│   └── coverage-analysis.md           # 網羅率分析
├── scripts/
│   ├── collect-lessons.mjs             # 新規教室収集スクリプト
│   └── geocode_google.mjs             # ジオコーディングスクリプト
└── src/
    ├── app/                            # Next.js App Router
    ├── components/                     # Reactコンポーネント
    ├── lib/                            # ユーティリティ
    └── types/                          # TypeScript型定義
```

---

## よく使うコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド確認
npm run build

# 新規都市のデータ収集
node scripts/collect-lessons.mjs --city 草津市 --prefecture 滋賀県

# ジオコーディング（座標nullのレコードのみ処理）
GOOGLE_MAPS_API_KEY=<key> node scripts/geocode_google.mjs --city 草津市
```
