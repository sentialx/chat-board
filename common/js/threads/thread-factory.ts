import { randomString } from "../random";

import { Thread } from "./thread";

export const createThread = <T = void>(
  id: string = randomString(8),
): Thread<T> => {
  return new Thread<T>(id);
};
