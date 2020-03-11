import * as React from 'react';
import { useFormik } from './useFormik';

// @todo fix type def
export type FormikContextType = ReturnType<typeof useFormik>;

export const FormikContext = createNamedContext<FormikContextType>(
  'FormikContext',
  {} as FormikContextType
);

function createNamedContext<ContextValueType>(
  name: string,
  defaultValue: ContextValueType
): React.Context<ContextValueType> {
  const Ctx = React.createContext<ContextValueType>(defaultValue);
  Ctx.displayName = name;
  return Ctx;
}
