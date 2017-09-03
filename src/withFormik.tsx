import * as React from 'react';

import {
  Formik,
  FormikActions,
  FormikComputedProps,
  FormikHandlers,
  FormikProps,
  FormikSharedConfig,
  FormikState,
  FormikValues,
} from './formik';

import { hoistNonReactStatics } from './hoistStatics';

/**
 * State, handlers, and helpers injected as props into the wrapped form component.
 * Used with withFormik()
 */
export type InjectedFormikProps<Props, Values> = Props &
  FormikState<Values> &
  FormikActions<Props> &
  FormikHandlers &
  FormikComputedProps;

/**
 * Formik actions + { props }
 */
export type FormikBag<P, V> = { props: P } & FormikActions<V>;

/**
 * withFormik() configuration options. Backwards compatible.
 */
export interface WithFormikConfig<
  Props,
  Values extends FormikValues = FormikValues,
  DeprecatedPayload = Values
> extends FormikSharedConfig {
  /**
   * Set the display name of the component. Useful for React DevTools.
   */
  displayName?: string;

  /** 
   * Submission handler 
   */
  handleSubmit: (values: Values, formikBag: FormikBag<Props, Values>) => void;

  /** 
   * Map props to the form values 
   */
  mapPropsToValues?: (props: Props) => Values;

  mapValuesToPayload?: (values: Values) => DeprecatedPayload;
}

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
}: WithFormikConfig<Props, Values, Payload>): ComponentDecorator<
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
