import * as React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import createContext from 'create-react-context';
import { FormikContext } from './types';

export const {
  Provider: FormikProvider,
  Consumer: FormikConsumer,
}: React.Context<FormikContext<any>> = (createContext as any)({} as any);

/**
 * Connect any component to Formik context, and inject as a prop called `formik`;
 * @param Comp React Component
 */
export function connect<OuterProps, Values = {}>(
  Comp: React.ComponentType<OuterProps & { formik: FormikContext<Values> }>
) {
  const C: React.SFC<OuterProps> = (props: OuterProps) => (
    <FormikConsumer>
      {formik => <Comp {...props} formik={formik} />}
    </FormikConsumer>
  );
  const componentDisplayName =
    Comp.displayName ||
    Comp.name ||
    (Comp.constructor && Comp.constructor.name) ||
    'Component';

  // Assign Comp to C.WrappedComponent so we can access the inner component in tests
  // For example, <Field.WrappedComponent /> gets us <FieldInner/>
  (C as React.SFC<OuterProps> & {
    WrappedComponent: React.ReactNode;
  }).WrappedComponent = Comp;

  C.displayName = `FormikConnect(${componentDisplayName})`;

  return hoistNonReactStatics(
    C,
    Comp as React.ComponentClass<OuterProps & { formik: FormikContext<Values> }> // cast type to ComponentClass (even if SFC)
  ) as React.ComponentType<OuterProps>;
}
