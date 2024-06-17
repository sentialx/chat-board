import { randomString } from "../random";

import { Task } from "./task";
import { TaskExecutionContext, TaskResult } from "./task-types";

export const createTask = <T, C extends Record<string, any>>(
  delegate: (ctx: TaskExecutionContext<C>) => TaskResult<T>,
  taskId: string = randomString(8),
): Task<T, C> => {
  const task = new Task<T, C>(delegate, taskId);
  return task;
};
