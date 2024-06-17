export const createThrottle = (time: number): (() => boolean) => {
  let last = 0;
  return (): boolean => {
    if (last + time < performance.now()) {
      last = performance.now();
      return true;
    }
    return false;
  };
};
