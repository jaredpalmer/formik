import * as React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

import { FormikContextType, FormikValues } from './types';
import { FormikConsumer } from './FormikContext';
import invariant from 'tiny-warning';

/**
 * Connect any component to Formik context, and inject as a prop called `formik`;
 * @param Comp React Component
 */
export function connect<TOuterProps, TFormikValues extends FormikValues = {}>(
  Comp: React.ComponentType<TOuterProps & { formik: FormikContextType<TFormikValues> }>
) {
  const C: React.FC<TOuterProps> = props => (
    <FormikConsumer>
      {formik => {
        invariant(
          !!formik,
          `Formik context is undefined, please verify you are rendering <Form>, <Field>, <FastField>, <FieldArray>, or your custom context-using component as a child of a <Formik> component. Component name: ${Comp.name}`
        );
        return <Comp {...props} formik={formik} />;
      }}
    </FormikConsumer>
  );

  const componentDisplayName =
    Comp.displayName ||
    Comp.name ||
    (Comp.constructor && Comp.constructor.name) ||
    'Component';

  // Assign Comp to C.WrappedComponent so we can access the inner component in tests
  // For example, <Field.WrappedComponent /> gets us <FieldInner/>
  (C as React.FC<TOuterProps> & {
    WrappedComponent: typeof Comp;
  }).WrappedComponent = Comp;

  C.displayName = `FormikConnect(${componentDisplayName})`;

  return hoistNonReactStatics(
    C,
    Comp as React.ComponentClass<
      TOuterProps & { formik: FormikContextType<TFormikValues> }
    > // cast type to ComponentClass (even if SFC)
  );
}
