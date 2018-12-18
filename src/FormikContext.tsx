import * as React from 'react';
import { FormikContext } from './types';

const PrivateFormikContext = React.createContext<FormikContext<any>>({} as any);
export const FormikProvider = PrivateFormikContext.Provider;
export const FormikConsumer = PrivateFormikContext.Consumer;

export function useFormikContext<Values>() {
  return React.useContext<FormikContext<Values>>(PrivateFormikContext);
}
