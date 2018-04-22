import hoistNonReactStatics from 'hoist-non-react-statics';
import createContext from 'create-react-context';
import * as React from 'react';
import { FormikProps } from './types';

export const FormikContext = createContext<FormikProps<any>>({} as any);

/**
 * Connect any component to Formik context, and inject as a prop called `formik`;
 * @param Comp React Component
 */
export function connect<Outer, Values = {}>(
  Comp: React.ComponentType<Outer & { formik: FormikProps<Values> }>
) {
  const C = (props: Outer) => (
    <FormikContext.Consumer>
      {formik => <Comp {...props} formik={formik} />}
    </FormikContext.Consumer>
  );

  return hoistNonReactStatics<Outer, Outer & { formik: FormikProps<Values> }>(
    C,
    Comp as React.ComponentClass<Outer & { formik: FormikProps<Values> }> // cast type to ComponentClass (even if SFC)
  ) as React.ComponentClass<Outer>;
}
