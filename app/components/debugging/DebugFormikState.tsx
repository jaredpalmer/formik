import * as React from 'react';
import { useFormikContext } from 'formik';
import { DebugProps } from './DebugProps';

export const DebugFormikState = () => {
  const formikState = useFormikContext();

  return <DebugProps {...formikState} />;
};
