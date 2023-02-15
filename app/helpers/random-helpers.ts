/**
 * @param minOrMax  // The maximum is exclusive and the minimum is inclusive
 * @param max
 */
export const selectRandomInt = (minOrMax: number, max?: number) => {
  const min = max ? minOrMax : 0;
  max = max ? max : minOrMax;
  return Math.floor(Math.random() * (max - min)) + min;
};
