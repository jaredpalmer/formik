import { useFormikState } from '@formik/reducer-refs';
import React from 'react';
import { DebugProps } from './DebugProps';

export const DebugFormikState = () => {
  const [formikState] = useFormikState();

  return <DebugProps {...formikState} />;
};
