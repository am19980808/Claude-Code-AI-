import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('環境変数バリデーション', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('必須変数が全て設定されている場合は正常に起動する', async () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.JWT_SECRET = 'a-secret-key-that-is-long-enough-32chars';
    process.env.JWT_EXPIRES_IN = '24h';

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    await expect(import('../config/env.js')).resolves.toBeDefined();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('DATABASE_URL が未設定の場合はエラーで終了する', async () => {
    process.env.JWT_SECRET = 'a-secret-key-that-is-long-enough-32chars';
    process.env.JWT_EXPIRES_IN = '24h';
    delete process.env.DATABASE_URL;

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(import('../config/env.js')).rejects.toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('JWT_SECRET が未設定の場合はエラーで終了する', async () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.JWT_EXPIRES_IN = '24h';
    delete process.env.JWT_SECRET;

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(import('../config/env.js')).rejects.toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('JWT_EXPIRES_IN が未設定の場合はエラーで終了する', async () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.JWT_SECRET = 'a-secret-key-that-is-long-enough-32chars';
    delete process.env.JWT_EXPIRES_IN;

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(import('../config/env.js')).rejects.toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
