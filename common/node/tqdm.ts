import * as cliProgress from "cli-progress";

import { TaskQueueExecutor } from "../js/tasks/task_queue_executor";

import { createThrottle } from "~/common/js/throttle";

export type TqdmStepper = () => void;

export const createTqdmStepper = (total: number): TqdmStepper => {
  let progress = 0;
  const throttle = createThrottle(50);

  const bar = new cliProgress.Bar(
    {
      format: " {bar} {percentage}% | ETA: {eta}s | {value}/{total}",
    },
    cliProgress.Presets.shades_classic,
  );
  bar.start(total, progress, { eta: 0 });

  const id = setInterval(() => {
    bar.update(progress);
  }, 50);

  return () => {
    progress++;
    if (progress === total) {
      bar.update(progress);
      bar.stop();
      clearInterval(id);
      return;
    }
    if (throttle()) {
      bar.update(progress);
      // bar.calculateETA();
    }
  };
};

export const createTqdm = (total: number) => {
  const stepper = createTqdmStepper(total);

  return <T, A extends any[]>(cb: (...args: A) => T) => {
    return (...args: A): T => {
      const res = cb(...args);
      if (res instanceof Promise) {
        return new Promise((resolve, reject) => {
          res
            .then((x) => {
              stepper();
              resolve(x);
            })
            .catch(reject);
        }) as any;
      }
      stepper();
      return res;
    };
  };
};

export function* tqdm<T>(arr: T[]): Iterable<T> {
  const stepper = createTqdmStepper(arr.length);

  for (let i = 0; i < arr.length; i++) {
    yield arr[i];
    stepper();
  }
}

export const tqem = <T extends TaskQueueExecutor>(tqe: T): T => {
  let tqdm: TqdmStepper | undefined;

  const superRunLoop = tqe.run.bind(tqe);

  const newRunLoop = async (): Promise<TaskQueueExecutor> => {
    tqdm = createTqdmStepper(tqe.taskQueue.getTasks().length);

    const doneTasks = tqe.taskQueue.getDoneTasks().length;
    for (let i = 0; i < doneTasks; i++) {
      tqdm();
    }

    await superRunLoop();

    return tqe;
  };
  tqe.run = newRunLoop.bind(tqe);

  const superTick = tqe.tick.bind(tqe);

  const newTick = async (): Promise<void> => {
    await superTick();
    tqdm?.();
  };
  tqe.tick = newTick.bind(tqe);

  return tqe;
};
