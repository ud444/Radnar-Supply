import { db } from "./prisma";

export async function getSetting<T = unknown>(key: string, fallback: T): Promise<T> {
  const row = await db.setting.findUnique({ where: { key } });
  if (!row) return fallback;
  try { return JSON.parse(row.value) as T; } catch { return fallback; }
}

export async function setSetting(key: string, value: unknown) {
  const v = JSON.stringify(value);
  await db.setting.upsert({
    where: { key }, update: { value: v }, create: { key, value: v },
  });
}
