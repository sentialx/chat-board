export type FlattenArray<T> = T extends (infer U)[]
  ? U extends (infer V)[]
    ? FlattenArray<V>
    : U
  : T;

export type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
    ? never
    : symbol extends K
    ? never
    : K]: T[K];
};

export type MethodNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export type UnwrapPromise<T> = T extends Promise<infer U>
  ? UnwrapPromise<U>
  : T;

export type FunctionParamsWithoutFirst<T extends (...args: any) => any> =
  T extends (...args: infer P) => any
    ? P extends [first: any, ...rest: infer R]
      ? R
      : never
    : never;

export type MaybeArray<T> = T | T[];

export type ClassDef<T = any> = new (...args: any[]) => T;
