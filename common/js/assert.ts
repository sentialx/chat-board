export const throwIfEmpty = <T = any>(val?: T, message?: string | Error): T => {
  if (!val) {
    if (message instanceof Error) throw message;
    throw new Error(message || "Value is empty");
  }
  return val;
};

export const assertValue = <T = any>(val?: T, message?: string | Error): T => {
  if (val == null) {
    if (message instanceof Error) throw message;
    throw new Error(message || "Value is empty");
  }
  return val;
};

export const unwrap = <T = any>(val?: T, message?: string | Error): T => {
  if (val == null) {
    if (message instanceof Error) throw message;
    throw new Error(message || "Value is empty");
  }
  return val;
};

export const assertEqual = <T>(a: T, b: T, message?: string | Error): void => {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    if (message instanceof Error) throw message;
    throw new Error(
      message || `Expected ${JSON.stringify(a)} to equal ${JSON.stringify(b)}`,
    );
  }
};

export const assertSameLength = <T extends any[] | string>(
  a: T,
  b: T,
  message?: string | Error,
): void => {
  if (a.length !== b.length) {
    if (message instanceof Error) throw message;
    throw new Error(
      message ||
        `Expected ${JSON.stringify(a)} to have same length as ${JSON.stringify(
          b,
        )}`,
    );
  }
};
