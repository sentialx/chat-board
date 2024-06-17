import { ResizableThreadPool } from "./resizable-thread-pool";
import { createThread } from "./thread-factory";

export const createThreadPool = async <T = any>(
  poolSize: number,
): Promise<ResizableThreadPool<T>> => {
  const threadPool = new ResizableThreadPool<T>(() => createThread());
  await threadPool.resize(poolSize);
  return threadPool;
};
