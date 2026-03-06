const REQUIRED_VARS = ['DATABASE_URL', 'JWT_SECRET', 'JWT_EXPIRES_IN'] as const;

function validateEnv(): void {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('[ERROR] 以下の必須環境変数が設定されていません:');
    missing.forEach((key) => console.error(`  - ${key}`));
    console.error('.env.example を参考に .env ファイルを作成してください。');
    process.exit(1);
  }
}

validateEnv();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN as string,
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;
