import { useFormikApi, useFullFormikState } from '@formik/reducer-refs';
import React from 'react';
import { DebugProps } from './DebugProps';

export const DebugFormikState = () => {
  const formikApi = useFormikApi();
  const formikState = useFullFormikState(formikApi);

  return <DebugProps {...formikState} />;
};
