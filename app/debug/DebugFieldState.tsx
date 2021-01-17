import { UseFieldProps, useField } from '@formik/reducer-refs';
import React from 'react';
import { DebugProps } from './DebugProps';

export const DebugFieldState = (props: UseFieldProps) => {
  const [field, meta, helpers] = useField(props);

  return <DebugProps {...{ ...field, ...meta, ...helpers }} />;
};
