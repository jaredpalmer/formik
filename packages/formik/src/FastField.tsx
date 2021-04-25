import * as React from 'react';
import { FormikValues, PathOf } from './types';
import { Field, FieldAttributes } from './Field';

/**
 * @deprecated Use Field + FieldConfig
 */
export type FastFieldConfig<Values, Path extends PathOf<Values>, ExtraProps> =
  FieldAttributes<Values, Path, ExtraProps> & {
    shouldUpdate?: (nextProps: any, props: {}) => boolean;
  };

/**
 * @deprecated Field now only subscribes to its own slice of Formik's state.
 */
export const FastField = <
  Values extends FormikValues = any,
  Path extends PathOf<Values> = any,
  ExtraProps = {}
>({ shouldUpdate, ...props}: FastFieldConfig<Values, Path, ExtraProps>) => (
  <Field {...(props as FieldAttributes<Values, Path, ExtraProps>)} />
);
