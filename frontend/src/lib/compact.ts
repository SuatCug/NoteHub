// Koşullu listelerden ([cond && item, ...]) false / '' / null / undefined elemanları atar; sonuç tipi T[] olur.
export const compact = <T>(items: (T | false | '' | null | undefined)[]): T[] =>
  items.filter((item): item is T => Boolean(item));
