import React from "react";

type RefsArray<T> = Array<
  | React.MutableRefObject<T | null | undefined>
  | React.ForwardedRef<T>
  | undefined
>;

export const setRefs =
  <T>(...refs: RefsArray<T>) =>
  (instance: T): void => {
    refs.forEach((r) => {
      if (!r) return;
      if (typeof r === "object") r.current = instance;
      if (typeof r === "function") r(instance);
    });
  };

type Unpacked<T> = T extends (infer K)[] ? K : T;

export const mergeEvents = <T extends Record<string, any>>(map: T) => {
  const finalObj: Record<string, any> = {};

  Object.keys(map).forEach((key) => {
    finalObj[key] = (...args: any[]) => {
      map[key].forEach((cb: any) => {
        cb?.(...args);
      });
    };
  });

  return finalObj as any as { [K in keyof T]: Unpacked<T[K]> };
};
