import { LETTERS_LOWERCASE, NUMBER_CHARS } from "./constants";

export const RANDOM_ID_CHARS = `${LETTERS_LOWERCASE}${LETTERS_LOWERCASE.toUpperCase()}${NUMBER_CHARS}`;

export const randomString = (length = 12, chars = RANDOM_ID_CHARS): string => {
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomItem = <T>(items: readonly T[]): T => {
  const randomIndex = randomInt(0, items.length - 1);
  return items[randomIndex];
};

export const randomBool = (prob = 0.5): boolean => {
  return Math.random() < prob;
};

export const shuffle = <T>(array: T[]): T[] => {
  const pool = [...array];
  const result: T[] = [];

  while (pool.length > 0) {
    const randomIndex = randomInt(0, pool.length - 1);
    result.push(pool.splice(randomIndex, 1)[0]);
  }

  return result;
};
