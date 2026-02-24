# 営業日報システム テスト仕様書

## 改訂履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0 | 2026-02-24 | 初版作成 |

---

## 1. 概要

本書は営業日報システムに対するテストの方針・範囲・テストケースを定義する。

---

## 2. テスト環境

| 項目 | 内容 |
|------|------|
| テスト環境URL | `https://staging.example.com` |
| APIベースURL | `https://api-staging.example.com/api/v1` |
| DBリセット | 各テストスイート実行前にテストデータを初期化する |
| ブラウザ | Chrome最新版 / Firefox最新版 / Safari最新版 |

---

## 3. テスト種別と方針

| 種別 | 略称 | 説明 | 対象 |
|------|------|------|------|
| APIテスト | API | エンドポイント単位のリクエスト/レスポンス検証 | 全APIエンドポイント |
| 権限テスト | AUTH | ロール別のアクセス制御検証 | 全エンドポイント |
| E2Eテスト | E2E | ユーザー操作シナリオの画面レベル検証 | 主要業務フロー |

### 優先度定義

| 優先度 | 説明 |
|--------|------|
| P1 | 必須。リリース前に必ず全件パスすること |
| P2 | 重要。基本的にパスすること |
| P3 | 任意。時間があれば実施する |

---

## 4. テストデータ

### 4-1. 共通テストユーザー

| ユーザーID | 氏名 | メール | パスワード | ロール | 上長 |
|-----------|------|--------|----------|--------|------|
| 1 | 山田 太郎 | yamada@test.com | Test1234! | sales | 上長A |
| 2 | 田中 花子 | tanaka@test.com | Test1234! | sales | 上長A |
| 3 | 佐藤 次郎 | sato@test.com | Test1234! | sales | 上長B |
| 4 | 上長A | manager-a@test.com | Test1234! | manager | - |
| 5 | 上長B | manager-b@test.com | Test1234! | manager | - |
| 6 | 管理者 | admin@test.com | Test1234! | admin | - |

### 4-2. 共通テスト顧客

| 顧客ID | 顧客名 | 担当営業 |
|--------|--------|---------|
| 101 | 株式会社ABC | 山田 太郎 |
| 102 | 有限会社XYZ | 山田 太郎 |
| 103 | 合同会社DEF | 田中 花子 |

### 4-3. テスト日報データ

| 日報ID | 作成者 | 報告日 | ステータス |
|--------|--------|--------|----------|
| 1001 | 山田 太郎 | 2026-02-20 | confirmed |
| 1002 | 山田 太郎 | 2026-02-21 | submitted |
| 1003 | 山田 太郎 | 2026-02-22 | draft |
| 1004 | 山田 太郎 | 2026-02-23 | rejected |
| 1005 | 田中 花子 | 2026-02-21 | submitted |
| 1006 | 佐藤 次郎 | 2026-02-21 | submitted |

---

## 5. APIテスト

---

### 5-1. 認証 API

#### TC-AUTH-001 正常ログイン

| 項目 | 内容 |
|------|------|
| テストID | TC-AUTH-001 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `POST /auth/login` |

**手順**

```
POST /auth/login
{
  "email": "yamada@test.com",
  "password": "Test1234!"
}
```

**期待結果**

- ステータスコード: `200`
- `data.token` が文字列で返却される
- `data.user.email` が `yamada@test.com` である
- `data.user.roles` に `sales` が含まれる

---

#### TC-AUTH-002 存在しないメールアドレスでログイン

| 項目 | 内容 |
|------|------|
| テストID | TC-AUTH-002 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `POST /auth/login` |

**手順**

```
POST /auth/login
{
  "email": "notexist@test.com",
  "password": "Test1234!"
}
```

**期待結果**

- ステータスコード: `401`
- `error.code` が `UNAUTHORIZED`

---

#### TC-AUTH-003 パスワード誤りでログイン

| 項目 | 内容 |
|------|------|
| テストID | TC-AUTH-003 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `POST /auth/login` |

**手順**

```
POST /auth/login
{
  "email": "yamada@test.com",
  "password": "WrongPassword!"
}
```

**期待結果**

- ステータスコード: `401`
- `error.code` が `UNAUTHORIZED`

---

#### TC-AUTH-004 必須項目なし（メール未入力）

| 項目 | 内容 |
|------|------|
| テストID | TC-AUTH-004 |
| 種別 | API |
| 優先度 | P2 |
| 対象API | `POST /auth/login` |

**手順**

```
POST /auth/login
{
  "password": "Test1234!"
}
```

**期待結果**

- ステータスコード: `400`
- `error.code` が `VALIDATION_ERROR`
- `error.details` に `email` フィールドのエラーが含まれる

---

#### TC-AUTH-005 Authorizationヘッダーなしでの保護エンドポイントアクセス

| 項目 | 内容 |
|------|------|
| テストID | TC-AUTH-005 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `GET /reports` |

**手順**

Authorizationヘッダーなしで `GET /reports` にリクエスト

**期待結果**

- ステータスコード: `401`
- `error.code` が `UNAUTHORIZED`

---

#### TC-AUTH-006 ログアウト後のトークンで API アクセス

| 項目 | 内容 |
|------|------|
| テストID | TC-AUTH-006 |
| 種別 | API |
| 優先度 | P2 |
| 対象API | `POST /auth/logout` → `GET /reports` |

**手順**

1. ログインしてトークンを取得
2. `POST /auth/logout`
3. 同トークンで `GET /reports` にリクエスト

**期待結果**

- ステータスコード: `401`

---

### 5-2. 日報 API

#### TC-RPT-001 日報一覧の正常取得

| 項目 | 内容 |
|------|------|
| テストID | TC-RPT-001 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `GET /reports` |
| 実行ユーザー | 山田 太郎（sales） |

**手順**

```
GET /reports
```

**期待結果**

- ステータスコード: `200`
- `data` が配列で返却される
- 山田太郎の日報のみ含まれる（他ユーザーの日報は含まれない）
- `meta.total` が山田太郎の日報件数と一致する

---

#### TC-RPT-002 日報一覧の期間絞り込み

| 項目 | 内容 |
|------|------|
| テストID | TC-RPT-002 |
| 種別 | API |
| 優先度 | P2 |
| 対象API | `GET /reports` |
| 実行ユーザー | 山田 太郎（sales） |

**手順**

```
GET /reports?from=2026-02-21&to=2026-02-21
```

**期待結果**

- ステータスコード: `200`
- 返却される日報の `report_date` が全て `2026-02-21` である
- 日報ID `1002` が含まれる

---

#### TC-RPT-003 日報一覧のステータス絞り込み

| 項目 | 内容 |
|------|------|
| テストID | TC-RPT-003 |
| 種別 | API |
| 優先度 | P2 |
| 対象API | `GET /reports` |
| 実行ユーザー | 山田 太郎（sales） |

**手順**

```
GET /reports?status=submitted
```

**期待結果**

- ステータスコード: `200`
- 返却される日報の `status` が全て `submitted` である

---

#### TC-RPT-004 日報の正常作成（提出）

| 項目 | 内容 |
|------|------|
| テストID | TC-RPT-004 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `POST /reports` |
| 実行ユーザー | 山田 太郎（sales） |

**手順**

```json
POST /reports
{
  "report_date": "2026-02-24",
  "visit_records": [
    {
      "customer_id": 101,
      "visit_content": "新製品の提案を実施。来週デモ予定。",
      "visited_at": "10:30"
    },
    {
      "customer_id": 102,
      "visit_content": "契約更新の確認。先方担当者変更あり。",
      "visited_at": "14:00"
    }
  ],
  "current_issues": "担当者変更が相次いでいる。",
  "tomorrow_tasks": "デモ資料を作成する。",
  "status": "submitted"
}
```

**期待結果**

- ステータスコード: `201`
- `data.report_id` が数値で返却される
- `data.status` が `submitted`
- `data.visit_records` が2件返却される
- 各 `visit_records` に `customer_name` が含まれる

---

#### TC-RPT-005 日報の下書き保存

| 項目 | 内容 |
|------|------|
| テストID | TC-RPT-005 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `POST /reports` |
| 実行ユーザー | 山田 太郎（sales） |

**手順**

`TC-RPT-004` と同じボディで `"status": "draft"` に変更してリクエスト（日付は別日にする）

**期待結果**

- ステータスコード: `201`
- `data.status` が `draft`

---

#### TC-RPT-006 同一日付の日報を重複登録

| 項目 | 内容 |
|------|------|
| テストID | TC-RPT-006 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `POST /reports` |
| 実行ユーザー | 山田 太郎（sales） |
| 前提条件 | 日報ID 1002（2026-02-21）が存在する |

**手順**

```json
POST /reports
{
  "report_date": "2026-02-21",
  "visit_records": [],
  "status": "draft"
}
```

**期待結果**

- ステータスコード: `409`
- `error.code` が `CONFLICT`

---

#### TC-RPT-007 訪問記録なしで日報作成

| 項目 | 内容 |
|------|------|
| テストID | TC-RPT-007 |
| 種別 | API |
| 優先度 | P2 |
| 対象API | `POST /reports` |
| 実行ユーザー | 山田 太郎（sales） |

**手順**

```json
POST /reports
{
  "report_date": "2026-02-25",
  "visit_records": [],
  "current_issues": "特になし",
  "tomorrow_tasks": "架電リストの整理",
  "status": "draft"
}
```

**期待結果**

- ステータスコード: `201`
- `data.visit_records` が空配列

---

#### TC-RPT-008 訪問内容が未入力の訪問記録を含む

| 項目 | 内容 |
|------|------|
| テストID | TC-RPT-008 |
| 種別 | API |
| 優先度 | P2 |
| 対象API | `POST /reports` |
| 実行ユーザー | 山田 太郎（sales） |

**手順**

```json
POST /reports
{
  "report_date": "2026-02-26",
  "visit_records": [
    {
      "customer_id": 101,
      "visit_content": ""
    }
  ],
  "status": "submitted"
}
```

**期待結果**

- ステータスコード: `400`
- `error.code` が `VALIDATION_ERROR`
- `error.details` に `visit_records[0].visit_content` のエラーが含まれる

---

#### TC-RPT-009 日報詳細の正常取得（自分の日報）

| 項目 | 内容 |
|------|------|
| テストID | TC-RPT-009 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `GET /reports/:id` |
| 実行ユーザー | 山田 太郎（sales） |

**手順**

```
GET /reports/1001
```

**期待結果**

- ステータスコード: `200`
- `data.report_id` が `1001`
- `data.sales_staff.name` が `山田 太郎`
- `data.visit_records` が配列で返却される
- `data.comments` が配列で返却される

---

#### TC-RPT-010 存在しない日報IDで詳細取得

| 項目 | 内容 |
|------|------|
| テストID | TC-RPT-010 |
| 種別 | API |
| 優先度 | P2 |
| 対象API | `GET /reports/:id` |
| 実行ユーザー | 山田 太郎（sales） |

**手順**

```
GET /reports/99999
```

**期待結果**

- ステータスコード: `404`
- `error.code` が `NOT_FOUND`

---

#### TC-RPT-011 下書き日報の更新

| 項目 | 内容 |
|------|------|
| テストID | TC-RPT-011 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `PUT /reports/:id` |
| 実行ユーザー | 山田 太郎（sales） |
| 前提条件 | 日報ID 1003（draft）が存在する |

**手順**

```json
PUT /reports/1003
{
  "report_date": "2026-02-22",
  "visit_records": [
    {
      "customer_id": 101,
      "visit_content": "更新した訪問内容"
    }
  ],
  "current_issues": "更新した課題",
  "tomorrow_tasks": "更新した明日の予定",
  "status": "draft"
}
```

**期待結果**

- ステータスコード: `200`
- `data.current_issues` が `更新した課題`
- `data.visit_records[0].visit_content` が `更新した訪問内容`

---

#### TC-RPT-012 提出済み日報を更新しようとする

| 項目 | 内容 |
|------|------|
| テストID | TC-RPT-012 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `PUT /reports/:id` |
| 実行ユーザー | 山田 太郎（sales） |
| 前提条件 | 日報ID 1002（submitted）が存在する |

**手順**

```json
PUT /reports/1002
{
  "report_date": "2026-02-21",
  "visit_records": [],
  "status": "submitted"
}
```

**期待結果**

- ステータスコード: `409`
- `error.code` が `INVALID_STATUS_TRANSITION`

---

#### TC-RPT-013 差し戻し日報の再編集・再提出

| 項目 | 内容 |
|------|------|
| テストID | TC-RPT-013 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `PUT /reports/:id` → `PATCH /reports/:id/submit` |
| 実行ユーザー | 山田 太郎（sales） |
| 前提条件 | 日報ID 1004（rejected）が存在する |

**手順**

1. `PUT /reports/1004` で内容を更新
2. `PATCH /reports/1004/submit` で再提出

**期待結果**

1. ステータスコード: `200`
2. ステータスコード: `200`、`data.status` が `submitted`

---

### 5-3. ステータス遷移 API

#### TC-STS-001 下書きから提出

| 項目 | 内容 |
|------|------|
| テストID | TC-STS-001 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `PATCH /reports/:id/submit` |
| 実行ユーザー | 山田 太郎（sales） |
| 前提条件 | 日報ID 1003（draft） |

**手順**

```
PATCH /reports/1003/submit
```

**期待結果**

- ステータスコード: `200`
- `data.status` が `submitted`

---

#### TC-STS-002 確認済みから提出しようとする（不正遷移）

| 項目 | 内容 |
|------|------|
| テストID | TC-STS-002 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `PATCH /reports/:id/submit` |
| 実行ユーザー | 山田 太郎（sales） |
| 前提条件 | 日報ID 1001（confirmed） |

**手順**

```
PATCH /reports/1001/submit
```

**期待結果**

- ステータスコード: `409`
- `error.code` が `INVALID_STATUS_TRANSITION`

---

#### TC-STS-003 上長が部下の日報を確認済みにする

| 項目 | 内容 |
|------|------|
| テストID | TC-STS-003 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `PATCH /reports/:id/confirm` |
| 実行ユーザー | 上長A（manager） |
| 前提条件 | 日報ID 1002（submitted、山田太郎） |

**手順**

```
PATCH /reports/1002/confirm
```

**期待結果**

- ステータスコード: `200`
- `data.status` が `confirmed`

---

#### TC-STS-004 上長が部下の日報を差し戻す

| 項目 | 内容 |
|------|------|
| テストID | TC-STS-004 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `PATCH /reports/:id/reject` |
| 実行ユーザー | 上長A（manager） |
| 前提条件 | 日報ID 1005（submitted、田中花子） |

**手順**

```json
PATCH /reports/1005/reject
{
  "reason": "訪問内容の詳細が不足しています。"
}
```

**期待結果**

- ステータスコード: `200`
- `data.status` が `rejected`
- `data.reject_reason` が `訪問内容の詳細が不足しています。`

---

#### TC-STS-005 差し戻し理由なしで差し戻しリクエスト

| 項目 | 内容 |
|------|------|
| テストID | TC-STS-005 |
| 種別 | API |
| 優先度 | P2 |
| 対象API | `PATCH /reports/:id/reject` |
| 実行ユーザー | 上長A（manager） |

**手順**

```json
PATCH /reports/1002/reject
{}
```

**期待結果**

- ステータスコード: `400`
- `error.code` が `VALIDATION_ERROR`

---

### 5-4. コメント API

#### TC-CMT-001 上長がコメントを投稿する

| 項目 | 内容 |
|------|------|
| テストID | TC-CMT-001 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `POST /reports/:id/comments` |
| 実行ユーザー | 上長A（manager） |
| 前提条件 | 日報ID 1002（山田太郎、submitted） |

**手順**

```json
POST /reports/1002/comments
{
  "content": "お疲れ様です。担当者変更の件は来週相談しましょう。"
}
```

**期待結果**

- ステータスコード: `201`
- `data.comment_id` が数値
- `data.commenter.name` が `上長A`
- `data.content` が入力内容と一致する

---

#### TC-CMT-002 コメント一覧取得

| 項目 | 内容 |
|------|------|
| テストID | TC-CMT-002 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `GET /reports/:id/comments` |
| 実行ユーザー | 山田 太郎（sales） |

**手順**

```
GET /reports/1002/comments
```

**期待結果**

- ステータスコード: `200`
- `data` が配列
- 各コメントに `comment_id`, `commenter`, `content`, `created_at` が含まれる

---

#### TC-CMT-003 コメント内容が空文字

| 項目 | 内容 |
|------|------|
| テストID | TC-CMT-003 |
| 種別 | API |
| 優先度 | P2 |
| 対象API | `POST /reports/:id/comments` |
| 実行ユーザー | 上長A（manager） |

**手順**

```json
POST /reports/1002/comments
{
  "content": ""
}
```

**期待結果**

- ステータスコード: `400`
- `error.code` が `VALIDATION_ERROR`

---

### 5-5. チーム日報 API

#### TC-TEAM-001 部下の日報一覧取得

| 項目 | 内容 |
|------|------|
| テストID | TC-TEAM-001 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `GET /team/reports` |
| 実行ユーザー | 上長A（manager） |

**手順**

```
GET /team/reports
```

**期待結果**

- ステータスコード: `200`
- 山田太郎・田中花子の日報が含まれる
- 佐藤次郎（上長Bの部下）の日報は含まれない

---

#### TC-TEAM-002 特定部下の日報絞り込み

| 項目 | 内容 |
|------|------|
| テストID | TC-TEAM-002 |
| 種別 | API |
| 優先度 | P2 |
| 対象API | `GET /team/reports` |
| 実行ユーザー | 上長A（manager） |

**手順**

```
GET /team/reports?sales_id=1
```

**期待結果**

- ステータスコード: `200`
- 全て `sales_staff.sales_id` が `1`（山田太郎）の日報

---

### 5-6. 顧客マスタ API

#### TC-CST-001 顧客一覧取得

| 項目 | 内容 |
|------|------|
| テストID | TC-CST-001 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `GET /master/customers` |
| 実行ユーザー | 管理者（admin） |

**期待結果**

- ステータスコード: `200`
- `data` が配列

---

#### TC-CST-002 顧客の新規登録

| 項目 | 内容 |
|------|------|
| テストID | TC-CST-002 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `POST /master/customers` |
| 実行ユーザー | 管理者（admin） |

**手順**

```json
POST /master/customers
{
  "customer_name": "テスト株式会社",
  "industry": "IT",
  "address": "東京都港区",
  "phone": "03-9999-9999",
  "assigned_sales_id": 1
}
```

**期待結果**

- ステータスコード: `201`
- `data.customer_name` が `テスト株式会社`
- `data.assigned_sales_staff.name` が `山田 太郎`

---

#### TC-CST-003 顧客名が未入力での登録

| 項目 | 内容 |
|------|------|
| テストID | TC-CST-003 |
| 種別 | API |
| 優先度 | P2 |
| 対象API | `POST /master/customers` |
| 実行ユーザー | 管理者（admin） |

**手順**

```json
POST /master/customers
{
  "industry": "IT"
}
```

**期待結果**

- ステータスコード: `400`
- `error.details` に `customer_name` のエラーが含まれる

---

#### TC-CST-004 顧客の更新

| 項目 | 内容 |
|------|------|
| テストID | TC-CST-004 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `PUT /master/customers/:id` |
| 実行ユーザー | 管理者（admin） |

**手順**

顧客ID 101 の `customer_name` を `株式会社ABC（更新済）` に変更

**期待結果**

- ステータスコード: `200`
- `data.customer_name` が `株式会社ABC（更新済）`

---

#### TC-CST-005 顧客の削除

| 項目 | 内容 |
|------|------|
| テストID | TC-CST-005 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `DELETE /master/customers/:id` |
| 実行ユーザー | 管理者（admin） |
| 前提条件 | 訪問記録が存在しない顧客を別途作成しておく |

**期待結果**

- ステータスコード: `204`

---

### 5-7. 営業マスタ API

#### TC-STF-001 営業担当者の新規登録

| 項目 | 内容 |
|------|------|
| テストID | TC-STF-001 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `POST /master/sales-staff` |
| 実行ユーザー | 管理者（admin） |

**手順**

```json
POST /master/sales-staff
{
  "name": "新規 太郎",
  "email": "newuser@test.com",
  "password": "NewPass123!",
  "department": "大阪営業部",
  "is_manager": false,
  "manager_id": 4
}
```

**期待結果**

- ステータスコード: `201`
- `data.name` が `新規 太郎`
- `data.manager.name` が `上長A`

---

#### TC-STF-002 メールアドレス重複で登録

| 項目 | 内容 |
|------|------|
| テストID | TC-STF-002 |
| 種別 | API |
| 優先度 | P1 |
| 対象API | `POST /master/sales-staff` |
| 実行ユーザー | 管理者（admin） |

**手順**

既存の `yamada@test.com` と同じメールアドレスで登録

**期待結果**

- ステータスコード: `409`
- `error.code` が `CONFLICT`

---

#### TC-STF-003 パスワードなしで登録（新規）

| 項目 | 内容 |
|------|------|
| テストID | TC-STF-003 |
| 種別 | API |
| 優先度 | P2 |
| 対象API | `POST /master/sales-staff` |
| 実行ユーザー | 管理者（admin） |

**手順**

`password` フィールドを省略してリクエスト

**期待結果**

- ステータスコード: `400`
- `error.details` に `password` のエラーが含まれる

---

#### TC-STF-004 パスワードなしで更新（変更なし扱い）

| 項目 | 内容 |
|------|------|
| テストID | TC-STF-004 |
| 種別 | API |
| 優先度 | P2 |
| 対象API | `PUT /master/sales-staff/:id` |
| 実行ユーザー | 管理者（admin） |

**手順**

`password` フィールドを省略して営業担当者情報を更新

**期待結果**

- ステータスコード: `200`
- 更新前のパスワードで引き続きログインできる

---

## 6. 権限テスト

---

#### TC-AZ-001 営業担当者が他人の日報を取得しようとする

| 項目 | 内容 |
|------|------|
| テストID | TC-AZ-001 |
| 種別 | AUTH |
| 優先度 | P1 |
| 対象API | `GET /reports/:id` |
| 実行ユーザー | 山田 太郎（sales） |
| 対象データ | 日報ID 1005（田中花子の日報） |

**期待結果**

- ステータスコード: `403`
- `error.code` が `FORBIDDEN`

---

#### TC-AZ-002 営業担当者がコメントを投稿しようとする

| 項目 | 内容 |
|------|------|
| テストID | TC-AZ-002 |
| 種別 | AUTH |
| 優先度 | P1 |
| 対象API | `POST /reports/:id/comments` |
| 実行ユーザー | 山田 太郎（sales） |

**期待結果**

- ステータスコード: `403`
- `error.code` が `FORBIDDEN`

---

#### TC-AZ-003 営業担当者がチーム日報一覧を取得しようとする

| 項目 | 内容 |
|------|------|
| テストID | TC-AZ-003 |
| 種別 | AUTH |
| 優先度 | P1 |
| 対象API | `GET /team/reports` |
| 実行ユーザー | 山田 太郎（sales） |

**期待結果**

- ステータスコード: `403`

---

#### TC-AZ-004 上長が部下以外の日報を確認済みにしようとする

| 項目 | 内容 |
|------|------|
| テストID | TC-AZ-004 |
| 種別 | AUTH |
| 優先度 | P1 |
| 対象API | `PATCH /reports/:id/confirm` |
| 実行ユーザー | 上長A（manager） |
| 対象データ | 日報ID 1006（佐藤次郎：上長Bの部下） |

**期待結果**

- ステータスコード: `403`
- `error.code` が `FORBIDDEN`

---

#### TC-AZ-005 営業担当者がマスタ管理APIにアクセスしようとする

| 項目 | 内容 |
|------|------|
| テストID | TC-AZ-005 |
| 種別 | AUTH |
| 優先度 | P1 |
| 対象API | `GET /master/customers` |
| 実行ユーザー | 山田 太郎（sales） |

**期待結果**

- ステータスコード: `403`

---

#### TC-AZ-006 上長がマスタ管理APIにアクセスしようとする

| 項目 | 内容 |
|------|------|
| テストID | TC-AZ-006 |
| 種別 | AUTH |
| 優先度 | P1 |
| 対象API | `POST /master/customers` |
| 実行ユーザー | 上長A（manager） |

**期待結果**

- ステータスコード: `403`

---

#### TC-AZ-007 営業担当者が他人の日報を更新しようとする

| 項目 | 内容 |
|------|------|
| テストID | TC-AZ-007 |
| 種別 | AUTH |
| 優先度 | P1 |
| 対象API | `PUT /reports/:id` |
| 実行ユーザー | 山田 太郎（sales） |
| 対象データ | 日報ID 1004（田中花子の日報） |

**期待結果**

- ステータスコード: `403`

---

## 7. E2Eテスト（画面操作シナリオ）

---

### TC-E2E-001 営業担当者による日報作成・提出フロー

| 項目 | 内容 |
|------|------|
| テストID | TC-E2E-001 |
| 種別 | E2E |
| 優先度 | P1 |
| 対象画面 | SCR-001 → SCR-002 → SCR-004 → SCR-006 |
| 実行ユーザー | 山田 太郎 |

**手順**

1. ログイン画面（SCR-001）にアクセス
2. `yamada@test.com` / `Test1234!` を入力してログインボタンをクリック
3. ダッシュボード（SCR-002）に遷移することを確認
4. 「今日の日報を作成」ボタンをクリック
5. 日報作成画面（SCR-004）で「訪問記録を追加」ボタンをクリック
6. 顧客を「株式会社ABC」から選択し、訪問内容を入力
7. 再度「訪問記録を追加」して2行目を入力
8. 「今の課題・相談」「明日やること」を入力
9. 「提出」ボタンをクリック
10. 日報詳細画面（SCR-006）に遷移することを確認

**期待結果**

- 手順2後：ダッシュボードが表示される
- 手順9後：日報詳細画面が表示され、ステータスが「提出済み」
- 訪問記録が2件表示されている
- 入力した課題・翌日行動が表示されている

---

### TC-E2E-002 上長による日報確認・コメント投稿フロー

| 項目 | 内容 |
|------|------|
| テストID | TC-E2E-002 |
| 種別 | E2E |
| 優先度 | P1 |
| 対象画面 | SCR-001 → SCR-007 → SCR-006 |
| 実行ユーザー | 上長A |
| 前提条件 | TC-E2E-001 実行後（山田太郎の提出済み日報が存在する） |

**手順**

1. 上長A（`manager-a@test.com`）でログイン
2. ダッシュボードの「部下日報一覧」ナビゲーションをクリック
3. 部下日報一覧（SCR-007）で山田太郎の当日日報をクリック
4. 日報詳細（SCR-006）でコメント入力欄にコメントを入力
5. 「コメント送信」ボタンをクリック
6. 「確認済みにする」ボタンをクリック

**期待結果**

- 手順3後：日報詳細画面に訪問記録・課題・翌日行動が表示されている
- 手順4：コメント入力欄が表示されている（上長のみ）
- 手順5後：コメントが一覧に追加表示される
- 手順6後：ステータスバッジが「確認済み」に変わる

---

### TC-E2E-003 営業担当者がコメントを確認するフロー

| 項目 | 内容 |
|------|------|
| テストID | TC-E2E-003 |
| 種別 | E2E |
| 優先度 | P1 |
| 対象画面 | SCR-002 → SCR-006 |
| 実行ユーザー | 山田 太郎 |
| 前提条件 | TC-E2E-002 実行後（上長からのコメントが存在する） |

**手順**

1. 山田太郎でログイン
2. ダッシュボード（SCR-002）の「未確認コメント一覧」を確認
3. 該当日報をクリックして日報詳細（SCR-006）に遷移
4. コメントセクションを確認

**期待結果**

- 手順2：未確認コメントの通知が表示されている
- 手順4：上長Aのコメントが表示されている
- コメント入力欄は表示されていない（営業担当者はコメント不可）

---

### TC-E2E-004 日報の差し戻し・再提出フロー

| 項目 | 内容 |
|------|------|
| テストID | TC-E2E-004 |
| 種別 | E2E |
| 優先度 | P1 |
| 対象画面 | SCR-006 → SCR-005 → SCR-006 |
| 前提条件 | 提出済みの日報が存在する |

**手順**

1. 上長Aでログインし、部下の提出済み日報の詳細を開く
2. 「差し戻し」ボタンをクリック
3. 差し戻し理由を入力してモーダルを確定
4. ステータスが「差し戻し」になることを確認
5. 山田太郎に切り替えてログイン
6. 日報一覧（SCR-003）で差し戻された日報を確認
7. 編集リンクをクリックして日報編集画面（SCR-005）へ
8. 内容を修正して「提出」をクリック

**期待結果**

- 手順3後：ステータスが「差し戻し」
- 手順6：差し戻し日報が赤色ステータスで表示される
- 手順8後：ステータスが「提出済み」に戻る

---

### TC-E2E-005 管理者による顧客マスタ登録フロー

| 項目 | 内容 |
|------|------|
| テストID | TC-E2E-005 |
| 種別 | E2E |
| 優先度 | P2 |
| 対象画面 | SCR-008 → SCR-009 → SCR-008 |
| 実行ユーザー | 管理者 |

**手順**

1. 管理者でログイン
2. ナビゲーションから「マスタ管理 > 顧客マスタ」をクリック
3. 「新規登録」ボタンをクリック
4. 顧客情報を入力して「保存」をクリック
5. 顧客一覧画面に戻り、登録した顧客が表示されることを確認

**期待結果**

- 手順4後：顧客一覧画面にリダイレクトされる
- 手順5：新規登録した顧客が一覧に表示される

---

### TC-E2E-006 バリデーションエラーの表示確認

| 項目 | 内容 |
|------|------|
| テストID | TC-E2E-006 |
| 種別 | E2E |
| 優先度 | P2 |
| 対象画面 | SCR-004 |
| 実行ユーザー | 山田 太郎 |

**手順**

1. 日報作成画面（SCR-004）を開く
2. 訪問記録を1行追加し、顧客を選択するが訪問内容は空のままにする
3. 「提出」ボタンをクリック

**期待結果**

- 画面遷移せず、エラーメッセージが表示される
- 訪問内容の入力欄の下にエラーメッセージが表示される

---

## 8. テストケース優先度サマリー

| 種別 | P1 | P2 | P3 | 合計 |
|------|----|----|----|----|
| APIテスト | 15 | 11 | 0 | 26 |
| 権限テスト | 7 | 0 | 0 | 7 |
| E2Eテスト | 4 | 2 | 0 | 6 |
| **合計** | **26** | **13** | **0** | **39** |
