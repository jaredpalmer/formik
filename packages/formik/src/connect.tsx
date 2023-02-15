import hoistNonReactStatics from 'hoist-non-react-statics';
import * as React from 'react';
import invariant from 'tiny-warning';
import { useFormikConfig, useFormikContext } from './FormikContext';
import { selectFullState } from './helpers/form-helpers';
import { FormikConnectedType } from './types';

/**
 * Connect any component to Formik context, and inject as a prop called `formik`;
 * @param Comp React Component
 */
export function connect<OuterProps, Values = {}>(
  Comp: React.ComponentType<OuterProps & { formik: FormikConnectedType<Values> }>
) {
  const C: React.FC<OuterProps> = (props: OuterProps) => {
    const formik = useFormikContext<Values>();
    const config = useFormikConfig<Values>();
    const state = formik.useState(selectFullState);

    invariant(
      !!formik,
      `Formik context is undefined, please verify you are rendering <Form>, <Field>, <FastField>, <FieldArray>, or your custom context-using component as a child of a <Formik> component. Component name: ${Comp.name}`
    );

    const legacyBag = {
      ...formik,
      ...config,
      ...state,
    }

    return <Comp {...props} formik={legacyBag} />;
  };

  const componentDisplayName =
    Comp.displayName ||
    Comp.name ||
    (Comp.constructor && Comp.constructor.name) ||
    'Component';

  // Assign Comp to C.WrappedComponent so we can access the inner component in tests
  // For example, <Field.WrappedComponent /> gets us <FieldInner/>
  (C as React.FC<OuterProps> & {
    WrappedComponent: React.ReactNode;
  }).WrappedComponent = Comp;

  C.displayName = `FormikConnect(${componentDisplayName})`;

  return hoistNonReactStatics(
    C,
    Comp as React.ComponentClass<
      OuterProps & { formik: FormikConnectedType<Values> }
    > // cast type to ComponentClass (even if SFC)
  ) as React.ComponentType<OuterProps>;
}
