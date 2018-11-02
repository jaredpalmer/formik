import * as React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { FormikCtx } from './types';
import { useFormikContext } from './FormikContext';

/**
 * Connect any component to Formik context, and inject as a prop called `formik`;
 * @param Comp React Component
 */
export function connect<OuterProps, Values = {}>(
  Comp: React.ComponentType<OuterProps & { formik: FormikCtx<Values> }>
) {
  const C: React.SFC<OuterProps> = (props: OuterProps) => {
    const formik = useFormikContext<Values>();
    return <Comp {...props} formik={formik} />;
  };
  // Assign Comp to C.WrappedComponent so we can access the inner component in tests
  // For example, <Field.WrappedComponent /> gets us <FieldInner/>
  (C as React.SFC<OuterProps> & {
    WrappedComponent: React.ReactNode;
  }).WrappedComponent = Comp;

  return hoistNonReactStatics<
    OuterProps,
    OuterProps & { formik: FormikCtx<Values> }
  >(
    C,
    Comp as React.ComponentClass<OuterProps & { formik: FormikCtx<Values> }> // cast type to ComponentClass (even if SFC)
  ) as React.ComponentClass<OuterProps> & {
    WrappedComponent: React.ComponentClass<
      OuterProps & { formik: FormikCtx<Values> }
    >;
  };
}
