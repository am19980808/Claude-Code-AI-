# 営業日報システム API仕様書

## 改訂履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0 | 2026-02-24 | 初版作成 |

---

## 1. 概要

### ベースURL

```
https://api.example.com/api/v1
```

### 認証方式

JWT（JSON Web Token）による Bearer 認証を使用する。

```
Authorization: Bearer <token>
```

ログインエンドポイント（`POST /auth/login`）以外の全リクエストに Authorization ヘッダーが必要。

### 共通リクエストヘッダー

| ヘッダー | 値 | 必須 |
|---------|-----|------|
| Content-Type | `application/json` | ○（リクエストボディあり時） |
| Authorization | `Bearer <token>` | ○（認証必須エンドポイント） |

### 共通レスポンス形式

**成功時**

```json
{
  "data": { ... }
}
```

**一覧取得時（ページネーション付き）**

```json
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

**エラー時**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": [
      {
        "field": "email",
        "message": "メールアドレスの形式が正しくありません"
      }
    ]
  }
}
```

### HTTPステータスコード

| コード | 説明 |
|--------|------|
| 200 | 取得・更新成功 |
| 201 | 作成成功 |
| 204 | 削除成功（レスポンスボディなし） |
| 400 | バリデーションエラー |
| 401 | 認証エラー（未ログイン・トークン期限切れ） |
| 403 | 権限エラー |
| 404 | リソースが存在しない |
| 409 | 競合エラー（例：同日の日報が既に存在する） |
| 500 | サーバーエラー |

### エラーコード一覧

| コード | 説明 |
|--------|------|
| `VALIDATION_ERROR` | リクエストパラメータが不正 |
| `UNAUTHORIZED` | 認証が必要 |
| `FORBIDDEN` | 操作権限がない |
| `NOT_FOUND` | リソースが見つからない |
| `CONFLICT` | リソースの競合（同日日報の重複など） |
| `INVALID_STATUS_TRANSITION` | 許可されていないステータス変更 |
| `INTERNAL_SERVER_ERROR` | サーバー内部エラー |

### 権限ロール

| ロール | 説明 |
|--------|------|
| `sales` | 営業担当者 |
| `manager` | 上長（部下の日報閲覧・コメント・承認が可能） |
| `admin` | 管理者（マスタ管理が可能） |

> 1ユーザーが複数ロールを持つ場合あり（例：管理者兼上長）

---

## 2. エンドポイント一覧

| カテゴリ | メソッド | パス | 概要 |
|---------|---------|------|------|
| 認証 | POST | `/auth/login` | ログイン |
| 認証 | POST | `/auth/logout` | ログアウト |
| 認証 | GET | `/auth/me` | ログインユーザー情報取得 |
| 日報 | GET | `/reports` | 自分の日報一覧取得 |
| 日報 | POST | `/reports` | 日報作成 |
| 日報 | GET | `/reports/:id` | 日報詳細取得 |
| 日報 | PUT | `/reports/:id` | 日報更新 |
| 日報 | PATCH | `/reports/:id/submit` | 日報提出 |
| 日報 | PATCH | `/reports/:id/confirm` | 日報確認済み |
| 日報 | PATCH | `/reports/:id/reject` | 日報差し戻し |
| コメント | GET | `/reports/:id/comments` | コメント一覧取得 |
| コメント | POST | `/reports/:id/comments` | コメント投稿 |
| チーム日報 | GET | `/team/reports` | 部下の日報一覧取得 |
| 顧客マスタ | GET | `/master/customers` | 顧客一覧取得 |
| 顧客マスタ | POST | `/master/customers` | 顧客登録 |
| 顧客マスタ | GET | `/master/customers/:id` | 顧客詳細取得 |
| 顧客マスタ | PUT | `/master/customers/:id` | 顧客更新 |
| 顧客マスタ | DELETE | `/master/customers/:id` | 顧客削除 |
| 営業マスタ | GET | `/master/sales-staff` | 営業担当者一覧取得 |
| 営業マスタ | POST | `/master/sales-staff` | 営業担当者登録 |
| 営業マスタ | GET | `/master/sales-staff/:id` | 営業担当者詳細取得 |
| 営業マスタ | PUT | `/master/sales-staff/:id` | 営業担当者更新 |
| 営業マスタ | DELETE | `/master/sales-staff/:id` | 営業担当者削除 |

---

## 3. 認証

---

### POST /auth/login

ログイン。成功するとJWTトークンを返す。

**認証不要**

**リクエストボディ**

```json
{
  "email": "yamada@example.com",
  "password": "password123"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| email | string | ○ | メールアドレス |
| password | string | ○ | パスワード |

**レスポンス `200 OK`**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2026-02-25T09:00:00+09:00",
    "user": {
      "sales_id": 1,
      "name": "山田 太郎",
      "email": "yamada@example.com",
      "department": "東京営業部",
      "is_manager": false,
      "roles": ["sales"]
    }
  }
}
```

**エラーレスポンス**

| ステータス | コード | 説明 |
|-----------|--------|------|
| 400 | `VALIDATION_ERROR` | 必須項目が不足 |
| 401 | `UNAUTHORIZED` | メールアドレスまたはパスワードが不正 |

---

### POST /auth/logout

ログアウト。サーバー側でトークンを無効化する。

**リクエストボディ** なし

**レスポンス `204 No Content`**

---

### GET /auth/me

ログイン中のユーザー情報を取得する。

**レスポンス `200 OK`**

```json
{
  "data": {
    "sales_id": 1,
    "name": "山田 太郎",
    "email": "yamada@example.com",
    "department": "東京営業部",
    "is_manager": false,
    "manager": {
      "sales_id": 5,
      "name": "鈴木 部長"
    },
    "roles": ["sales"]
  }
}
```

---

## 4. 日報

---

### GET /reports

ログインユーザー自身の日報一覧を取得する。

**権限** `sales` / `manager`

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| from | string (date) | - | 期間開始日 `YYYY-MM-DD`（デフォルト：当月1日） |
| to | string (date) | - | 期間終了日 `YYYY-MM-DD`（デフォルト：当月末日） |
| status | string | - | `draft` / `submitted` / `confirmed` / `rejected` |
| page | integer | - | ページ番号（デフォルト：1） |
| per_page | integer | - | 1ページあたりの件数（デフォルト：20、最大：100） |

**レスポンス `200 OK`**

```json
{
  "data": [
    {
      "report_id": 101,
      "report_date": "2026-02-24",
      "status": "submitted",
      "visit_count": 3,
      "has_unread_comment": true,
      "created_at": "2026-02-24T18:00:00+09:00",
      "updated_at": "2026-02-24T18:30:00+09:00"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "per_page": 20,
    "total_pages": 3
  }
}
```

---

### POST /reports

日報を新規作成する。

**権限** `sales` / `manager`

**リクエストボディ**

```json
{
  "report_date": "2026-02-24",
  "visit_records": [
    {
      "customer_id": 10,
      "visit_content": "新製品の提案を行い、前向きな反応をもらった。来週デモを実施予定。",
      "visited_at": "10:30"
    },
    {
      "customer_id": 15,
      "visit_content": "既存契約の更新について確認。先方担当者変更あり、引き継ぎ対応が必要。",
      "visited_at": "14:00"
    }
  ],
  "current_issues": "先方担当者の変更が多く、関係構築のコストが増えている。アプローチ方法を相談したい。",
  "tomorrow_tasks": "株式会社ABCへのデモ資料を作成する。担当者引き継ぎのフォローメールを送る。",
  "status": "submitted"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| report_date | string (date) | ○ | 報告日 `YYYY-MM-DD` |
| visit_records | array | - | 訪問記録の配列（0件可） |
| visit_records[].customer_id | integer | ○ | 顧客ID |
| visit_records[].visit_content | string | ○ | 訪問内容（最大1000文字） |
| visit_records[].visited_at | string (time) | - | 訪問時刻 `HH:MM` |
| current_issues | string | - | 今の課題・相談（最大2000文字） |
| tomorrow_tasks | string | - | 明日やること（最大2000文字） |
| status | string | ○ | `draft`（下書き）または `submitted`（提出） |

**レスポンス `201 Created`**

```json
{
  "data": {
    "report_id": 101,
    "report_date": "2026-02-24",
    "status": "submitted",
    "visit_records": [
      {
        "visit_id": 201,
        "customer_id": 10,
        "customer_name": "株式会社ABC",
        "visit_content": "新製品の提案を行い、前向きな反応をもらった。来週デモを実施予定。",
        "visited_at": "10:30"
      },
      {
        "visit_id": 202,
        "customer_id": 15,
        "customer_name": "有限会社XYZ",
        "visit_content": "既存契約の更新について確認。先方担当者変更あり、引き継ぎ対応が必要。",
        "visited_at": "14:00"
      }
    ],
    "current_issues": "先方担当者の変更が多く、関係構築のコストが増えている。アプローチ方法を相談したい。",
    "tomorrow_tasks": "株式会社ABCへのデモ資料を作成する。担当者引き継ぎのフォローメールを送る。",
    "created_at": "2026-02-24T18:00:00+09:00",
    "updated_at": "2026-02-24T18:00:00+09:00"
  }
}
```

**エラーレスポンス**

| ステータス | コード | 説明 |
|-----------|--------|------|
| 400 | `VALIDATION_ERROR` | 入力値が不正 |
| 409 | `CONFLICT` | 同日の日報が既に存在する |

---

### GET /reports/:id

日報の詳細を取得する。

**権限** `sales`（自分の日報のみ）/ `manager`（部下の日報も可）/ `admin`

**パスパラメータ**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | integer | 日報ID |

**レスポンス `200 OK`**

```json
{
  "data": {
    "report_id": 101,
    "report_date": "2026-02-24",
    "status": "submitted",
    "sales_staff": {
      "sales_id": 1,
      "name": "山田 太郎",
      "department": "東京営業部"
    },
    "visit_records": [
      {
        "visit_id": 201,
        "customer_id": 10,
        "customer_name": "株式会社ABC",
        "visit_content": "新製品の提案を行い、前向きな反応をもらった。来週デモを実施予定。",
        "visited_at": "10:30"
      }
    ],
    "current_issues": "先方担当者の変更が多く、関係構築のコストが増えている。アプローチ方法を相談したい。",
    "tomorrow_tasks": "株式会社ABCへのデモ資料を作成する。担当者引き継ぎのフォローメールを送る。",
    "comments": [
      {
        "comment_id": 301,
        "commenter": {
          "sales_id": 5,
          "name": "鈴木 部長"
        },
        "content": "担当者変更の件、来週の1on1で一緒に対策を考えましょう。",
        "created_at": "2026-02-24T20:00:00+09:00"
      }
    ],
    "created_at": "2026-02-24T18:00:00+09:00",
    "updated_at": "2026-02-24T18:30:00+09:00"
  }
}
```

**エラーレスポンス**

| ステータス | コード | 説明 |
|-----------|--------|------|
| 403 | `FORBIDDEN` | 閲覧権限がない |
| 404 | `NOT_FOUND` | 日報が存在しない |

---

### PUT /reports/:id

日報を更新する。ステータスが `draft` または `rejected` の場合のみ更新可能。

**権限** `sales` / `manager`（自分の日報のみ）

**リクエストボディ**

`POST /reports` と同じ形式。`report_date` は変更不可。

**レスポンス `200 OK`**

`GET /reports/:id` と同じ形式。

**エラーレスポンス**

| ステータス | コード | 説明 |
|-----------|--------|------|
| 400 | `VALIDATION_ERROR` | 入力値が不正 |
| 403 | `FORBIDDEN` | 他人の日報または編集不可ステータス |
| 404 | `NOT_FOUND` | 日報が存在しない |
| 409 | `INVALID_STATUS_TRANSITION` | `submitted` / `confirmed` の日報は編集不可 |

---

### PATCH /reports/:id/submit

日報を提出する（`draft` → `submitted`）。

**権限** `sales` / `manager`（自分の日報のみ）

**リクエストボディ** なし

**レスポンス `200 OK`**

```json
{
  "data": {
    "report_id": 101,
    "status": "submitted",
    "updated_at": "2026-02-24T18:30:00+09:00"
  }
}
```

**エラーレスポンス**

| ステータス | コード | 説明 |
|-----------|--------|------|
| 403 | `FORBIDDEN` | 他人の日報 |
| 404 | `NOT_FOUND` | 日報が存在しない |
| 409 | `INVALID_STATUS_TRANSITION` | `draft` 以外からは提出不可 |

---

### PATCH /reports/:id/confirm

日報を確認済みにする（`submitted` → `confirmed`）。

**権限** `manager`（部下の日報のみ）

**リクエストボディ** なし

**レスポンス `200 OK`**

```json
{
  "data": {
    "report_id": 101,
    "status": "confirmed",
    "updated_at": "2026-02-24T20:00:00+09:00"
  }
}
```

**エラーレスポンス**

| ステータス | コード | 説明 |
|-----------|--------|------|
| 403 | `FORBIDDEN` | 部下以外の日報 または 上長権限がない |
| 404 | `NOT_FOUND` | 日報が存在しない |
| 409 | `INVALID_STATUS_TRANSITION` | `submitted` 以外は確認不可 |

---

### PATCH /reports/:id/reject

日報を差し戻す（`submitted` → `rejected`）。

**権限** `manager`（部下の日報のみ）

**リクエストボディ**

```json
{
  "reason": "訪問内容の記載が不足しています。商談の結論と次のアクションを明記してください。"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| reason | string | ○ | 差し戻し理由（最大500文字） |

**レスポンス `200 OK`**

```json
{
  "data": {
    "report_id": 101,
    "status": "rejected",
    "reject_reason": "訪問内容の記載が不足しています。商談の結論と次のアクションを明記してください。",
    "updated_at": "2026-02-24T20:00:00+09:00"
  }
}
```

**エラーレスポンス**

| ステータス | コード | 説明 |
|-----------|--------|------|
| 400 | `VALIDATION_ERROR` | 理由が未入力 |
| 403 | `FORBIDDEN` | 部下以外の日報 または 上長権限がない |
| 404 | `NOT_FOUND` | 日報が存在しない |
| 409 | `INVALID_STATUS_TRANSITION` | `submitted` 以外は差し戻し不可 |

---

## 5. コメント

---

### GET /reports/:id/comments

日報に紐づくコメント一覧を取得する。

**権限** `sales`（自分の日報のみ）/ `manager`（部下の日報も可）

**レスポンス `200 OK`**

```json
{
  "data": [
    {
      "comment_id": 301,
      "commenter": {
        "sales_id": 5,
        "name": "鈴木 部長"
      },
      "content": "担当者変更の件、来週の1on1で一緒に対策を考えましょう。",
      "created_at": "2026-02-24T20:00:00+09:00",
      "updated_at": "2026-02-24T20:00:00+09:00"
    }
  ]
}
```

---

### POST /reports/:id/comments

日報にコメントを投稿する。

**権限** `manager`（部下の日報のみ）

**リクエストボディ**

```json
{
  "content": "担当者変更の件、来週の1on1で一緒に対策を考えましょう。"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| content | string | ○ | コメント内容（最大1000文字） |

**レスポンス `201 Created`**

```json
{
  "data": {
    "comment_id": 301,
    "commenter": {
      "sales_id": 5,
      "name": "鈴木 部長"
    },
    "content": "担当者変更の件、来週の1on1で一緒に対策を考えましょう。",
    "created_at": "2026-02-24T20:00:00+09:00",
    "updated_at": "2026-02-24T20:00:00+09:00"
  }
}
```

**エラーレスポンス**

| ステータス | コード | 説明 |
|-----------|--------|------|
| 400 | `VALIDATION_ERROR` | 内容が未入力または文字数超過 |
| 403 | `FORBIDDEN` | 部下以外の日報 または 上長権限がない |
| 404 | `NOT_FOUND` | 日報が存在しない |

---

## 6. チーム日報（上長向け）

---

### GET /team/reports

ログイン中の上長の部下全員の日報一覧を取得する。

**権限** `manager`

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| from | string (date) | - | 期間開始日（デフォルト：当月1日） |
| to | string (date) | - | 期間終了日（デフォルト：当月末日） |
| sales_id | integer | - | 特定の部下で絞り込み |
| status | string | - | `submitted` / `confirmed` / `rejected` |
| page | integer | - | ページ番号（デフォルト：1） |
| per_page | integer | - | 件数（デフォルト：20、最大：100） |

**レスポンス `200 OK`**

```json
{
  "data": [
    {
      "report_id": 101,
      "report_date": "2026-02-24",
      "status": "submitted",
      "sales_staff": {
        "sales_id": 1,
        "name": "山田 太郎",
        "department": "東京営業部"
      },
      "visit_count": 3,
      "has_new_comment_target": false
    }
  ],
  "meta": {
    "total": 30,
    "page": 1,
    "per_page": 20,
    "total_pages": 2
  }
}
```

---

## 7. 顧客マスタ

---

### GET /master/customers

顧客一覧を取得する。

**権限** `admin`

> 日報作成画面での顧客選択のために `sales` / `manager` も読み取り可能とする（`?for=select` パラメータ付き時のみ、id・nameのみ返却）

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| q | string | - | 顧客名・業種での部分一致検索 |
| for | string | - | `select` を指定すると簡易レスポンス（id・nameのみ） |
| page | integer | - | ページ番号 |
| per_page | integer | - | 件数（デフォルト：20） |

**レスポンス `200 OK`**

```json
{
  "data": [
    {
      "customer_id": 10,
      "customer_name": "株式会社ABC",
      "industry": "製造業",
      "address": "東京都千代田区...",
      "phone": "03-1234-5678",
      "assigned_sales_staff": {
        "sales_id": 1,
        "name": "山田 太郎"
      },
      "created_at": "2026-01-10T10:00:00+09:00",
      "updated_at": "2026-01-10T10:00:00+09:00"
    }
  ],
  "meta": {
    "total": 200,
    "page": 1,
    "per_page": 20,
    "total_pages": 10
  }
}
```

---

### POST /master/customers

顧客を新規登録する。

**権限** `admin`

**リクエストボディ**

```json
{
  "customer_name": "株式会社ABC",
  "industry": "製造業",
  "address": "東京都千代田区丸の内1-1-1",
  "phone": "03-1234-5678",
  "assigned_sales_id": 1
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| customer_name | string | ○ | 顧客名（最大100文字） |
| industry | string | - | 業種（最大50文字） |
| address | string | - | 住所（最大200文字） |
| phone | string | - | 電話番号 |
| assigned_sales_id | integer | - | 担当営業ID |

**レスポンス `201 Created`**

```json
{
  "data": {
    "customer_id": 10,
    "customer_name": "株式会社ABC",
    "industry": "製造業",
    "address": "東京都千代田区丸の内1-1-1",
    "phone": "03-1234-5678",
    "assigned_sales_staff": {
      "sales_id": 1,
      "name": "山田 太郎"
    },
    "created_at": "2026-02-24T10:00:00+09:00",
    "updated_at": "2026-02-24T10:00:00+09:00"
  }
}
```

---

### GET /master/customers/:id

顧客の詳細を取得する。

**権限** `admin`

**レスポンス `200 OK`**

`POST /master/customers` のレスポンスと同じ形式。

---

### PUT /master/customers/:id

顧客情報を更新する。

**権限** `admin`

**リクエストボディ**

`POST /master/customers` と同じ形式。

**レスポンス `200 OK`**

`POST /master/customers` のレスポンスと同じ形式。

---

### DELETE /master/customers/:id

顧客を削除する。

**権限** `admin`

> 訪問記録に紐づく顧客は削除不可（論理削除で対応）

**レスポンス `204 No Content`**

**エラーレスポンス**

| ステータス | コード | 説明 |
|-----------|--------|------|
| 404 | `NOT_FOUND` | 顧客が存在しない |

---

## 8. 営業マスタ

---

### GET /master/sales-staff

営業担当者一覧を取得する。

**権限** `admin`

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| q | string | - | 氏名・部署での部分一致検索 |
| is_manager | boolean | - | 上長のみ絞り込む場合 `true` |
| page | integer | - | ページ番号 |
| per_page | integer | - | 件数（デフォルト：20） |

**レスポンス `200 OK`**

```json
{
  "data": [
    {
      "sales_id": 1,
      "name": "山田 太郎",
      "email": "yamada@example.com",
      "department": "東京営業部",
      "is_manager": false,
      "manager": {
        "sales_id": 5,
        "name": "鈴木 部長"
      },
      "created_at": "2026-01-01T09:00:00+09:00",
      "updated_at": "2026-01-01T09:00:00+09:00"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "per_page": 20,
    "total_pages": 3
  }
}
```

---

### POST /master/sales-staff

営業担当者を新規登録する。

**権限** `admin`

**リクエストボディ**

```json
{
  "name": "山田 太郎",
  "email": "yamada@example.com",
  "password": "securePassword123",
  "department": "東京営業部",
  "is_manager": false,
  "manager_id": 5
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| name | string | ○ | 氏名（最大50文字） |
| email | string | ○ | メールアドレス（重複不可） |
| password | string | ○ | パスワード（8文字以上） |
| department | string | - | 部署（最大50文字） |
| is_manager | boolean | - | 上長フラグ（デフォルト：false） |
| manager_id | integer | - | 上長のsales_id |

**レスポンス `201 Created`**

```json
{
  "data": {
    "sales_id": 1,
    "name": "山田 太郎",
    "email": "yamada@example.com",
    "department": "東京営業部",
    "is_manager": false,
    "manager": {
      "sales_id": 5,
      "name": "鈴木 部長"
    },
    "created_at": "2026-02-24T10:00:00+09:00",
    "updated_at": "2026-02-24T10:00:00+09:00"
  }
}
```

**エラーレスポンス**

| ステータス | コード | 説明 |
|-----------|--------|------|
| 400 | `VALIDATION_ERROR` | 入力値が不正 |
| 409 | `CONFLICT` | メールアドレスが既に使用されている |

---

### GET /master/sales-staff/:id

営業担当者の詳細を取得する。

**権限** `admin`

**レスポンス `200 OK`**

`POST /master/sales-staff` のレスポンスと同じ形式。

---

### PUT /master/sales-staff/:id

営業担当者情報を更新する。

**権限** `admin`

**リクエストボディ**

`POST /master/sales-staff` と同じ形式。ただし `password` は省略可（省略時は変更なし）。

**レスポンス `200 OK`**

`POST /master/sales-staff` のレスポンスと同じ形式。

---

### DELETE /master/sales-staff/:id

営業担当者を削除する。

**権限** `admin`

> 日報が存在する担当者は論理削除。ログイン不可となる。

**レスポンス `204 No Content`**

**エラーレスポンス**

| ステータス | コード | 説明 |
|-----------|--------|------|
| 404 | `NOT_FOUND` | 営業担当者が存在しない |

---

## 9. ステータス遷移まとめ

```
日報ステータス:

  [作成]
    ↓
  draft（下書き）
    ↓ PATCH /submit
  submitted（提出済み）
    ↓ PATCH /confirm          ↓ PATCH /reject
  confirmed（確認済み）      rejected（差し戻し）
                                ↓ PUT /reports/:id + PATCH /submit
                              submitted（再提出）
```

| 現在のステータス | 操作 | 遷移後ステータス | 実行者 |
|----------------|------|----------------|--------|
| `draft` | 提出 | `submitted` | 本人 |
| `submitted` | 確認 | `confirmed` | 上長 |
| `submitted` | 差し戻し | `rejected` | 上長 |
| `rejected` | 編集→再提出 | `submitted` | 本人 |
