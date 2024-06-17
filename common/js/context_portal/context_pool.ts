import { randomUUID } from "crypto";

import { getLogger } from "../logging/logger";

import { Context } from "./context";

export interface ContextFunctionCallMessage<T> {
  type: "start";
  callId: string;
  data: T;
}

export interface ContextFunctionResultMessage<T> {
  type: "result";
  callId: string;
  result: T;
}

export type ContextMessageHandler = (msg: any, worker: Context) => void;

export interface ContextMetadata {
  isDone: boolean;
  id: string;
  isReady: boolean;
  context: Context;
}

export abstract class ContextPool {
  private messageHandler: ContextMessageHandler = () => {};

  private contexts: ContextMetadata[] = [];

  constructor() {}

  public setMessageHandler(handler: ContextMessageHandler): void {
    this.messageHandler = handler;
  }

  public async addContext(context: Context): Promise<ContextMetadata> {
    return new Promise((resolve) => {
      const contextMetadata: ContextMetadata = {
        context,
        isDone: true,
        id: randomUUID(),
        isReady: false,
      };

      this.contexts.push(contextMetadata);

      context.messenger.addListener("message", (msg: any) => {
        // TODO: remove log
        if (msg.type === "log") {
          getLogger()[msg.level](msg.str);
        }

        if (msg.type === "ready") {
          resolve(contextMetadata);
        }

        this.messageHandler(msg, context);
      });

      context.messenger.once("exit", (code) => {
        if (code !== 0) throw new Error(`Context exited with code ${code}`);
        for (let i = 0; i < this.contexts.length; i++) {
          if (this.contexts[i].id === contextMetadata.id) {
            this.contexts[i].context.messenger.removeAllListeners();
            this.contexts.splice(i, 1);
            break;
          }
        }
      });

      context.messenger.postMessage({ type: "connect" });
    });
  }

  public get contextsCount(): number {
    return this.contexts.length;
  }

  protected abstract stopContext(context: Context): void;

  public cleanup(): void {
    this.contexts.forEach((x) => this.stopContext(x.context));
  }

  private getFreeContext(): ContextMetadata | undefined {
    return this.contexts.find((x) => x.isDone === true);
  }

  public async delegateWork<T>(data: any): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const context = this.getFreeContext();
      if (!context) throw new Error("No free contexts");
      context.isDone = false;

      const { messenger } = context.context;

      const callId = randomUUID();

      const finishHandler = (msg: ContextFunctionResultMessage<T>): void => {
        if (msg.type === "result" && msg.callId === callId) {
          messenger.off("error", reject);
          messenger.off("message", finishHandler);
          context.isDone = true;

          resolve(msg.result);
        }
      };

      messenger.addListener("message", finishHandler);
      messenger.once("error", reject);
      messenger.postMessage({
        type: "start",
        callId,
        data,
      } as ContextFunctionCallMessage<any>);
    });
  }
}
