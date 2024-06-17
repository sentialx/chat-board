import { EventEmitter } from "../event_emitter";
import { EventRegistry } from "../event_registry";

import { ITask } from "./task-types";
import { IThread, ThreadExecutionContext } from "./thread-types";

export interface ThreadLockStatusUpdateEvent {
  thread: Thread<any>;
}

export type ThreadEvents = {
  lockStatusUpdate: (e: ThreadLockStatusUpdateEvent) => void;
};

export class Thread<T = void>
  extends EventRegistry<ThreadEvents>
  implements IThread<T>
{
  protected readonly eventEmitter = new EventEmitter<ThreadEvents>(this);

  private task: ITask<T, ThreadExecutionContext<T>> | undefined = undefined;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  private _isInitialized = false;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  private _isAlive = false;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  private _isRunning = false;

  private metadata: any | undefined = undefined;

  private _isLocked = false;

  private _lockData: any | undefined = undefined;

  constructor(private readonly id: string) {
    super();
  }

  public getId(): string {
    return this.id;
  }

  public init(): void {
    this._isInitialized = true;
    this._isAlive = true;
  }

  public kill(): void {
    this._isAlive = false;
  }

  public isInitialized(): boolean {
    return this._isInitialized;
  }

  public isAlive(): boolean {
    return this._isAlive && this._isInitialized;
  }

  public isRunning(): boolean {
    return this._isRunning;
  }

  public getTask(): ITask<T, ThreadExecutionContext<T>> | undefined {
    return this.task;
  }

  public canRun(): boolean {
    return this.isAlive() && !this.isRunning();
  }

  public async run(task: ITask<T, ThreadExecutionContext<T>>): Promise<T> {
    if (!this.canRun()) {
      throw new Error("Thread is not able to run task.");
    }
    this._isRunning = true;
    try {
      const taskRes = await task.run({ thread: this });
      this._isRunning = false;
      return taskRes;
    } catch (error) {
      this._isRunning = false;
      throw error;
    }
  }

  public setMetadata<K>(metadata?: K): Thread<T> {
    this.metadata = metadata;
    return this;
  }

  public getMetadata<K>(): K | undefined {
    return this.metadata;
  }

  public lock<L>(data?: L): IThread<T> {
    if (this.isLocked()) return this;
    this._isLocked = true;
    this._lockData = data;
    this.eventEmitter.emit("lockStatusUpdate", { thread: this });
    return this;
  }

  public getLockHandle<L>(): L | undefined {
    return this._lockData;
  }

  public unlock(): IThread<T> {
    if (!this.isLocked()) return this;
    this._isLocked = false;
    this._lockData = undefined;
    this.eventEmitter.emit("lockStatusUpdate", { thread: this });
    return this;
  }

  public isLocked(): boolean {
    return this._isLocked;
  }
}
