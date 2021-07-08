import { selectRandomInt } from './random-helpers';

export const selectRange = (count: number) => Array.from(Array(count).keys());

export const selectRandomArrayItem = <T extends any>(array: T[]) => {
  const index = selectRandomInt(array.length);

  return array[index];
};
