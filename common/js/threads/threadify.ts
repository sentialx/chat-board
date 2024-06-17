import { FunctionParamsWithoutFirst, UnwrapPromise } from "../types";

import { createTask } from "./task-factory";
import { TaskExecutionContext } from "./task-types";
import { ThreadScheduler } from "./thread-scheduler";

export const threadify = <
  T extends (
    ctx: TaskExecutionContext<Record<string, any>>,
    ...args: any[]
  ) => Promise<any>,
>(
  delegate: T,
  threadScheduler: ThreadScheduler<UnwrapPromise<ReturnType<T>>>,
): ((...args: FunctionParamsWithoutFirst<T>) => Promise<ReturnType<T>>) => {
  const factory = async (
    ...args: FunctionParamsWithoutFirst<T>
  ): Promise<ReturnType<T>> => {
    const task = createTask((ctx) => delegate(ctx, ...args));
    const res = await threadScheduler.run(task);
    return res as ReturnType<T>;
  };
  return factory;
};
