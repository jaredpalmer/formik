import * as React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import createContext, {
  ProviderProps,
  ConsumerProps,
} from 'create-react-context';
import { FormikContext } from './types';

export const { Provider, Consumer } = createContext<FormikContext<any> | void>(
  undefined
);

export function FormikProvider<Values>(
  props: ProviderProps<FormikContext<Values>>
) {
  return <Provider value={props.value} children={props.children} />;
}

export function FormikConsumer<Values>(
  props: ConsumerProps<FormikContext<Values>>
) {
  return (
    <Consumer
      children={formik => {
        if (typeof formik === 'undefined') {
          throw new Error(
            'FormikConsumer called outside of a provider. This means you nested a' +
              '<Field /> or connect() outside of a root <Formik /> element'
          );
        }
        // Not sure why the create-react-context permits this Array signature.
        return Array.isArray(props.children)
          ? props.children[0](formik as FormikContext<Values>)
          : props.children(formik as FormikContext<Values>);
      }}
    />
  );
}

/**
 * Connect any component to Formik context, and inject as a prop called `formik`;
 * @param Comp React Component
 */
export function connect<OuterProps, Values>(
  Comp: React.ComponentType<OuterProps & { formik: FormikContext<Values> }>
) {
  const C: React.SFC<OuterProps> = (props: OuterProps) => (
    <FormikConsumer<Values>>
      {formik => <Comp {...props} formik={formik} />}
    </FormikConsumer>
  );
  // Assign Comp to C.WrappedComponent so we can access the inner component in tests
  // For example, <Field.WrappedComponent /> gets us <FieldInner/>
  (C as React.SFC<OuterProps> & {
    WrappedComponent: React.ReactNode;
  }).WrappedComponent = Comp;

  return hoistNonReactStatics<
    OuterProps,
    OuterProps & { formik: FormikContext<Values> }
  >(
    C,
    Comp as React.ComponentClass<OuterProps & { formik: FormikContext<Values> }> // cast type to ComponentClass (even if SFC)
  ) as React.ComponentClass<OuterProps> & {
    WrappedComponent: React.ComponentClass<
      OuterProps & { formik: FormikContext<Values> }
    >;
  };
}
