import * as React from 'react';
import createContext from 'create-react-context';
import { FormikProps } from './types';

export const FormikContext = createContext<FormikProps<any>>({} as any);

/**
 * Connect any component to Formik context, and inject as a prop called `formik`;
 * @param Comp React Component
 */
export function connect<Outer, Values = {}>(
  Comp: React.ComponentType<Outer & { formik: FormikProps<Values> }>
) {
  return (props: Outer) => (
    <FormikContext.Consumer>
      {formik => <Comp {...props} formik={formik} />}
    </FormikContext.Consumer>
  );
}
