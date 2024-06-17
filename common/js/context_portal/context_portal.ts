import { v4 } from "uuid";

import { Context, ContextMessenger } from "./context";
import {
  ContextFunctionCallMessage,
  ContextFunctionResultMessage,
  ContextPool,
} from "./context_pool";
import { limitedArrayMap } from "./utils";

interface ContextFunctionCallData {
  fn: string;
  args: any[];
  bridgeId: string;
}

export abstract class ContextPortal<T extends object, U extends object> {
  public portalId: any; // shared - must be the same on both contexts

  private contextPool?: ContextPool; // main

  private childFns = new Map<string, any>(); // shared
  private mainFns = new Map<string, any>(); // shared
  private movedFnId = 0; // shared

  constructor(portalId: any) {
    this.portalId = portalId;
  }

  public init(): void {
    if (this.isMainContext()) {
      this.contextPool = this.createContextPool();
      this.registerMainContextListeners();
    } else {
      this.registerChildContextListeners();
    }
  }

  private registerMessageHandler<T>(handler: T): T {
    return handler;
  }

  // On thread
  private async functionCallHandler(
    map: Map<string, any>,
    msg: ContextFunctionCallMessage<ContextFunctionCallData>,
    messenger: ContextMessenger,
  ): Promise<void> {
    if (msg.type === "start" && msg.data.bridgeId === this.portalId) {
      if (!msg.data.fn)
        throw new Error(`Function ${msg.data.fn} not found in API`);

      messenger.postMessage({
        type: "result",
        callId: msg.callId,
        result: await map.get(msg.data.fn)(...msg.data.args),
      } as ContextFunctionResultMessage<any>);
    }
  }

  // On main thread
  private registerMainContextListeners(): void {
    this.contextPool!.setMessageHandler((msg, context) => {
      this.functionCallHandler(this.mainFns, msg, context.messenger);
    });
  }

  // On thread
  private registerChildContextListeners(): void {
    this.getChildContext().messenger.addListener(
      "message",
      this.registerMessageHandler((msg: any) => {
        this.functionCallHandler(
          this.childFns,
          msg,
          this.getChildContext().messenger,
        );
      }),
    );

    this.getChildContext().messenger.once(
      "message",
      this.registerMessageHandler(async (msg: any) => {
        if (msg.type === "stop") {
          this.onStopRequested(msg);
        }
      }),
    );

    this.getChildContext().messenger.postMessage({ type: "ready" });
  }

  public abstract isMainContext(): boolean;

  // On thread
  protected abstract getChildContext(): Context;

  protected abstract createContextPool(): ContextPool;

  protected abstract onStopRequested(msg: any): void;

  public get contextsCount(): number {
    return this.contextPool?.contextsCount ?? 0;
  }

  // On main thread
  public cleanup(): void {
    if (this.isMainContext()) {
      this.contextPool!.cleanup();
    }
  }

  public portalToChild<T, A extends any[]>(
    fn: (...args: A) => T,
  ): (...args: A) => Promise<T> {
    return this.proxifyFunction(
      fn,
      this.createContextFunctionProxy,
      this.isMainContext(),
      this.childFns,
    ) as any;
  }

  public portalToMain<T, A extends any[]>(
    fn: (...args: A) => T,
  ): (...args: A) => T {
    return this.proxifyFunction(
      fn,
      this.createMainFunctionProxy,
      !this.isMainContext,
      this.mainFns,
    ) as any;
  }

  public assertOnMain<T, A extends any[]>(
    fn: (...args: A) => T,
  ): (...args: A) => T {
    return (...args: A) => {
      if (!this.isMainContext) {
        throw new Error("Not in main context");
      }

      return fn(...args);
    };
  }

  public entryPoint<T, A extends any[]>(fn: () => void): void {
    if (this.isMainContext()) fn();
  }

  // On main thread
  public async map<T, U>(
    array: T[],
    fn: (item: T, index: number) => Promise<U>,
  ): Promise<U[]> {
    return limitedArrayMap(array, fn, this.contextsCount);
  }

  // On thread
  private createMainFunctionProxy = (fnName: string) => {
    return async (...args: any[]): Promise<any> => {
      return new Promise((resolve) => {
        const callId = v4();
        this.getChildContext().messenger.once(
          "message",
          (msg: ContextFunctionResultMessage<any>) => {
            if (msg.type === "result" && msg.callId === callId) {
              resolve(msg.result);
            }
          },
        );
        this.getChildContext().messenger.postMessage({
          type: "start",
          callId,
          data: { fn: fnName, args, bridgeId: this.portalId },
        } as ContextFunctionCallMessage<ContextFunctionCallData>);
      });
    };
  };

  // On main thread
  private createContextFunctionProxy = (fnName: string) => {
    return async (...args: any[]): Promise<any> => {
      return this.contextPool!.delegateWork({
        fn: fnName,
        args,
        bridgeId: this.portalId,
      } as ContextFunctionCallData);
    };
  };

  private proxifyFunction<T, A extends any[]>(
    fn: (...args: A) => T,
    proxyFnFactory: (fnName: string) => (...args: A) => Promise<T>,
    shouldProxy: boolean,
    mapToSaveTo: Map<string, any>,
  ): (...args: A) => Promise<T> {
    let f: any;
    const fnName = `fn${this.movedFnId++}`;

    if (shouldProxy) {
      f = proxyFnFactory(fnName);
    } else {
      f = fn;
    }

    mapToSaveTo.set(fnName, f);
    return f;
  }
}
