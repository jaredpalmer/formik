import { FormikApi } from 'formik';
import { useMemo, useEffect } from 'react';
import { selectRandomInt } from './random-helpers';

export type DynamicValues = Record<string, string>;

export const useChaosHelpers = (
  formik: FormikApi<DynamicValues>,
  array: number[]
) => {
  return useMemo(
    () => [
      () =>
        formik.setValues(
          array.reduce<Record<string, string>>((prev, id) => {
            prev[`Input ${id}`] = selectRandomInt(500).toString();

            if (prev[`Input ${id}`]) {
            }

            return prev;
          }, {})
        ),
      () =>
        formik.setErrors(
          array.reduce<Record<string, string>>((prev, id) => {
            const error = selectRandomInt(500);

            // leave some errors empty
            prev[`Input ${id}`] = error % 5 === 0 ? '' : error.toString();

            return prev;
          }, {})
        ),
      () =>
        formik.setTouched(
          array.reduce<Record<string, boolean>>((prev, id) => {
            prev[`Input ${id}`] = selectRandomInt(500) % 2 === 0;

            return prev;
          }, {})
        ),
      () => formik.submitForm(),
      () =>
        formik.setFieldValue(
          `Input ${selectRandomInt(array.length)}`,
          selectRandomInt(500).toString()
        ),
      () =>
        formik.setFieldError(
          `Input ${selectRandomInt(array.length)}`,
          selectRandomInt(500).toString()
        ),
      () =>
        formik.setFieldTouched(
          `Input ${selectRandomInt(array.length)}`,
          selectRandomInt(2) % 2 === 0
        ),
      () => formik.setStatus(selectRandomInt(500).toString()),
      () => formik.resetForm(),
    ],
    [array, formik]
  );
};

let skipCount = 0;

/**
 * https://github.com/dai-shi/will-this-react-global-state-work-in-concurrent-mode
 */
export const useAutoUpdate = () => {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      skipCount += 1;

      if (skipCount % 10 === 0) {
        document.getElementById('update-without-transition')?.click();
      }
    }
  }, []);

  // SSR
  if (typeof performance !== 'undefined') {
    const start = performance?.now();
    while (performance?.now() - start < 2) {
      // empty
    }
  }
};
