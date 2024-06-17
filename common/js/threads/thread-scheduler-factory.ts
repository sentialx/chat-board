import { IThreadManager } from "./thread-manager-types";
import { ThreadScheduler } from "./thread-scheduler";

export const createThreadScheduler = <T = any>(
  threadManager: IThreadManager<T>,
): ThreadScheduler<T> => {
  const threadScheduler = new ThreadScheduler<T>(
    (task, scheduler) => threadManager.getRunnableThread(),
    (task, thread) => {},
  );

  return threadScheduler;
};
