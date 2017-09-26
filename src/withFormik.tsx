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
import { isFunction } from './utils';

/**
 * State, handlers, and helpers injected as props into the wrapped form component.
 * Used with withFormik()
 */
export type InjectedFormikProps<Props, Values> = Props &
  FormikState<Values> &
  FormikActions<Values> &
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

  /**
   * @deprecated in 0.9.0 (but needed to break TS types)
   */
  mapValuesToPayload?: (values: Values) => DeprecatedPayload;

  /** 
   * A Yup Schema or a function that returns a Yup schema 
   */
  validationSchema?: any | ((props: Props) => any);

  /** 
   * Validation function. Must return an error object or promise that 
   * throws an error object where that object keys map to corresponding value.
   */
  validate?: (values: any, props: Props) => void | object | Promise<any>;
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
    /**
     * We need to use closures here for to provide the wrapped component's props to
     * the respective withFormik config methods. 
     */
    class C extends React.Component<Props, {}> {
      validate = (values: Values): void | object | Promise<any> => {
        return config.validate!(values, this.props);
      };

      validationSchema = () => {
        return isFunction(config.validationSchema)
          ? config.validationSchema!(this.props)
          : config.validationSchema;
      };

      handleSubmit = (values: Values, actions: FormikActions<Values>) => {
        return config.handleSubmit(values as Values, {
          ...actions,
          props: this.props,
        });
      };

      /**
       * Just avoiding a render callback for perf here
       */
      renderFormComponent = (formikProps: FormikProps<Values>) => {
        return <Component {...this.props} {...formikProps} />;
      };

      render() {
        return (
          <Formik
            {...this.props}
            {...config}
            validate={config.validate && this.validate}
            validationSchema={config.validationSchema && this.validationSchema}
            initialValues={mapPropsToValues(this.props)}
            onSubmit={this.handleSubmit}
            render={this.renderFormComponent}
          />
        );
      }
    }

    return hoistNonReactStatics<Props>(
      C as any,
      Component as React.ComponentClass<InjectedFormikProps<Props, Values>> // cast type to ComponentClass (even if SFC)
    ) as React.ComponentClass<Props>;
  };
}
