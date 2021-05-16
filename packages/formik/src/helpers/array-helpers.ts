/**
 * Some array helpers!
 */
 export const copyArrayLike = (arrayLike: ArrayLike<any>) => {
    if (!arrayLike) {
      return [];
    } else if (Array.isArray(arrayLike)) {
      return [...arrayLike];
    } else {
      const maxIndex = Object.keys(arrayLike)
        .map(key => parseInt(key))
        .reduce((max, el) => (el > max ? el : max), 0);
      return Array.from({ ...arrayLike, length: maxIndex + 1 });
    }
  };

  export const arrayMove = (array: any[], from: number, to: number) => {
    const copy = copyArrayLike(array);
    const value = copy[from];
    copy.splice(from, 1);
    copy.splice(to, 0, value);
    return copy;
  };

  export const arraySwap = (
    arrayLike: ArrayLike<any>,
    indexA: number,
    indexB: number
  ) => {
    const copy = copyArrayLike(arrayLike);
    const a = copy[indexA];
    copy[indexA] = copy[indexB];
    copy[indexB] = a;
    return copy;
  };

  export const arrayInsert = (
    arrayLike: ArrayLike<any>,
    index: number,
    value: any
  ) => {
    const copy = copyArrayLike(arrayLike);
    copy.splice(index, 0, value);
    return copy;
  };

  export const arrayReplace = (
    arrayLike: ArrayLike<any>,
    index: number,
    value: any
  ) => {
    const copy = copyArrayLike(arrayLike);
    copy[index] = value;
    return copy;
  };