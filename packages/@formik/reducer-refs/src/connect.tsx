import hoistNonReactStatics from 'hoist-non-react-statics';
import * as React from 'react';
import invariant from 'tiny-warning';
import { FormikConsumer } from './contexts/FormikContext';
import { FormikContextType } from '@formik/core';

/**
 * Connect any component to Formik context, and inject as a prop called `formik`;
 * @param Comp React Component
 */
export function connect<OuterProps, Values = {}>(
  Comp: React.ComponentType<OuterProps & { formik: FormikContextType<Values> }>
) {
  const C: React.FC<OuterProps> = (props: OuterProps) => (
    <FormikConsumer
      children={(formik: FormikContextType<Values>) => {
        invariant(
          !!formik,
          `Formik context is undefined, please verify you are rendering <Form>, <Field>, <FastField>, <FieldArray>, or your custom context-using component as a child of a <Formik> component. Component name: ${Comp.name}`
        );
        return <Comp {...props} formik={formik} />;
      }}
    />
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
    Comp as React.ComponentClass<
      OuterProps & { formik: FormikContextType<Values> }
    > // cast type to ComponentClass (even if SFC)
  ) as React.ComponentType<OuterProps>;
}
