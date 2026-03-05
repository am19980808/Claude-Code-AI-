# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このリポジトリは営業日報システムの設計ドキュメントを管理します。

営業担当者が日報を作成・提出し、上長がレビュー・コメントを行うシステムの仕様をまとめています。

- Remote: https://github.com/am19980808/Claude-Code-AI-
- Default branch: `master`

## docs/ ファイル構成

| ファイル                     | 説明                                                                |
| ---------------------------- | ------------------------------------------------------------------- |
| `docs/screen-definition.md`  | 画面設計書 — 画面一覧・画面遷移・各画面の入力項目・操作定義         |
| `docs/api-specification.md`  | API仕様書 — エンドポイント一覧・リクエスト/レスポンス形式・認証方式 |
| `docs/test-specification.md` | テスト仕様書 — テスト方針・APIテスト・権限テスト・E2Eテストケース   |

## 仕様書

@docs/screen-definition.md
@docs/api-specification.md
@docs/test-specification.md

## Git Workflow

作業完了後は必ず以下を実行すること：

```bash
git add .
git commit -m "適切なコミットメッセージ"
git push origin master
```

#使用言語
**言語** TypeScript
**フレームワーク** Next.js(App Router)
**UIコンポーネント** shadcn/ui + Tailwind CSS
**APIスキーマ定義** OpenAPI(Zodによる検証)
**DBスキーマ定義** Prisma.js
**テスト** Vitest
**デプロイ** Google Cloud Run
