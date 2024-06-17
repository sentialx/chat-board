export interface OptionProperties {
  isSome?: boolean;
  error?: Error;
}

export class Option<T = any> {
  constructor(
    private readonly value: T | null,
    private readonly properties: OptionProperties = {},
  ) {}

  public get isSome(): boolean {
    if (typeof this.properties.isSome === "boolean") {
      return this.properties.isSome;
    }
    return this.value != null;
  }

  public get isNone(): boolean {
    return !this.isSome;
  }

  public unwrap(): T {
    if (this.isNone) {
      if (this.properties.error) {
        throw this.properties.error;
      }
      throw new OptionNoValueException();
    }
    return this.value as T;
  }

  public unwrapOr(defaultValue: T): T {
    return this.isNone ? defaultValue : this.unwrap();
  }

  public unwrapUnchecked(): T | undefined | null {
    return this.value;
  }
}

export class OptionNoValueException extends Error {
  constructor() {
    super(`No value`);
    this.name = "OptionNoValueException";

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export const Some = <T = any>(
  value: T,
  properties: OptionProperties = {},
): Option<T> => new Option<T>(value, properties);

export const None = new Option<any>(null);

export const unwrapOrThrow = <T>(
  value: T | undefined,
  err?: string | Error,
): T => {
  if (value == null) {
    throw err || new Error(`Value is null or undefined`);
  }
  return value;
};
