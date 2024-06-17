import { ClassDef } from "../js/types";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const instanceProvider = <T extends ClassDef>(id: string, target: T) => {
  return {
    provide: id,
    inject: [target],
    useFactory: (instance: T): any => {
      return instance;
    },
  };
};
