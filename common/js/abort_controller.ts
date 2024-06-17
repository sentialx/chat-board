import { EventEmitter } from "./event_emitter";
import { EventRegistry, EventRegistryBase } from "./event_registry";
import { randomString } from "./random";

export class CanceledException extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, CanceledException.prototype);
  }
}

export class CancelTokenSource implements ICancelTokenSource {
  private readonly _token: CancelToken | undefined;

  protected readonly _tokenEventEmitter: EventEmitter<ICancelTokenEvents>;

  private _isRequested = false;

  private _reason?: string = undefined;

  constructor() {
    this._token = new CancelToken(randomString(8), {
      isRequested: (): boolean => this._isRequested,
      getReason: (): any => this._reason,
    });
    this._tokenEventEmitter = new EventEmitter<ICancelTokenEvents>(this._token);
  }

  public getToken(): CancelToken {
    return this._token!;
  }

  public cancel(reason?: any): void {
    this._isRequested = true;
    this._reason = reason;
    this._tokenEventEmitter.emit("requested", reason);
  }
}

export interface CancelTokenDelegates {
  isRequested: () => boolean;
  getReason: () => string | undefined;
}

export class CancelToken
  extends EventRegistry<ICancelTokenEvents>
  implements ICancelToken
{
  constructor(
    private readonly id: string,
    private readonly delegates: CancelTokenDelegates,
  ) {
    super();
  }

  public throwIfRequested(): void {
    if (this.delegates.isRequested()) {
      const reason = this.delegates.getReason();
      throw new CanceledException(reason);
    }
  }

  public getId(): string {
    return this.id;
  }

  public isRequested(): boolean {
    return this.delegates.isRequested();
  }
}

export interface ICancelTokenSource {
  getToken(): ICancelToken;
  cancel(reason?: any): void;
}

export type ICancelTokenEvents = {
  requested: (reason?: string) => void;
};

export type ICancelTokenEventRegistry = EventRegistryBase<ICancelTokenEvents>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ICancelToken extends ICancelTokenEventRegistry {
  getId(): string;
  isRequested(): boolean;
  throwIfRequested(): void;
}
