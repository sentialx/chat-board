import * as _deepMerge from "deepmerge";

export const deepMerge = <T = any, K = any, R = any>(
  target: T,
  source: K,
): R => {
  return _deepMerge.all([target as any, source as any]) as R;
};

export const mapToObject = <T = any>(
  map: Map<string, T>,
): { [key: string]: T } => {
  const obj = {};
  map.forEach((v, k) => {
    (obj as any)[k] = v;
  });
  return obj;
};

export const deepCopy = <T = any>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const assignObjectProps = <T>(obj: T, other: Partial<T>): T => {
  for (const key in other) {
    if (other[key] !== undefined) {
      (obj as any)[key] = other[key];
    }
  }
  return obj;
};

export type TransposeObjectArrayIntoKeyArray<
  T extends Record<string, any>,
  K extends keyof T,
> = {
  [P in K]: T[P][];
};

export const transposeObjectArrayIntoKeyArray = <
  T extends Record<string, any>,
  K extends keyof T,
>(
  items: T[],
  keys: K[],
): TransposeObjectArrayIntoKeyArray<T, K> => {
  const tranposed = {} as Record<K, T[K][]>;
  for (const key of keys) {
    tranposed[key] = [];
  }

  for (const item of items) {
    for (const key of keys) {
      tranposed[key].push(item[key]);
    }
  }

  return tranposed as TransposeObjectArrayIntoKeyArray<T, K>;
};
