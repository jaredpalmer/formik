import * as React from 'react';
import { UseFieldProps, useField } from 'formik';
import { DebugProps } from './DebugProps';

export const DebugFieldState = (props: UseFieldProps) => {
  const [field, meta, helpers] = useField(props);

  return <DebugProps {...{ ...field, ...meta, ...helpers }} />;
};
