import { EventRegistryBase } from "../events";

export interface ContextMessenger
  extends EventRegistryBase<{
    message: (message: any) => void;
    error: (error: Error) => void;
    exit: (code: number) => void;
  }> {
  postMessage: (message: any) => void;
  removeAllListeners(): void;
  setMaxListeners(n: number): void;
}

export interface Context {
  messenger: ContextMessenger;
}
