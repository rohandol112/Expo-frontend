export const SUPPORTED_NEWS_CATEGORY_IDS = new Set(Array.from({ length: 12 }, (_, index) => String(index + 1)));

export function isSupportedNewsCategoryId(id: string | number) {
  return SUPPORTED_NEWS_CATEGORY_IDS.has(String(id));
}
