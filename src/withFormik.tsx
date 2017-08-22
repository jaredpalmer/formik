import * as React from 'react';

import { Formik, FormikConfig, FormikProps, FormikValues } from './next';

import { InjectedFormikProps } from './formik';
import { hoistNonReactStatics } from './hoistStatics';

export type CompositeComponent<P> =
  | React.ComponentClass<P>
  | React.StatelessComponent<P>;

export interface ComponentDecorator<TOwnProps, TMergedProps> {
  (component: CompositeComponent<TMergedProps>): React.ComponentClass<
    TOwnProps
  >;
}

export interface InferableComponentDecorator<TOwnProps> {
  <T extends CompositeComponent<TOwnProps>>(component: T): T;
}

/**
 * A public higher-order component to access the imperative API
 */
export function withFormik<
  Props,
  Values extends FormikValues,
  Payload = Values
>({
  mapPropsToValues = (vanillaProps: any) => {
    let val: FormikValues = {} as FormikValues;
    for (let k in vanillaProps) {
      if (
        vanillaProps.hasOwnProperty(k) &&
        typeof vanillaProps[k] !== 'function'
      ) {
        val[k] = vanillaProps[k];
      }
    }
    return val;
  },
  ...config,
}: FormikConfig<Props, Values, Payload>): ComponentDecorator<
  Props,
  InjectedFormikProps<Props, Values>
> {
  return function createFormik(Component: CompositeComponent<Props>) {
    const C: React.SFC<Props> = props => {
      return (
        <Formik
          {...props}
          {...config}
          getInitialValues={mapPropsToValues(props)}
          render={(formikProps: FormikProps<Values>) =>
            <Component {...props} {...formikProps} />}
        />
      );
    };
    return hoistNonReactStatics<Props>(
      C as any,
      Component as React.ComponentClass<InjectedFormikProps<Props, Values>> // cast type to ComponentClass (even if SFC)
    ) as React.ComponentClass<Props>;
  };
}
