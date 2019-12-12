import hoistNonReactStatics from 'hoist-non-react-statics';
import * as React from 'react';
import { Formik } from './Formik';
import {
  FormikHelpers,
  FormikProps,
  FormikSharedConfig,
  FormikValues,
  FormikTouched,
  FormikErrors,
} from './types';
import { isFunction } from './utils';

/**
 * State, handlers, and helpers injected as props into the wrapped form component.
 * Used with withFormik()
 *
 * @deprecated  Use `OuterProps & FormikProps<Values>` instead.
 */
export type InjectedFormikProps<Props, Values> = Props & FormikProps<Values>;

/**
 * Formik actions + { props }
 */
export type FormikBag<P, V> = { props: P } & FormikHelpers<V>;

/**
 * withFormik() configuration options. Backwards compatible.
 */
export interface WithFormikConfig<
  Props,
  Values extends FormikValues = FormikValues,
  DeprecatedPayload = Values
> extends FormikSharedConfig<Props> {
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
   * Map props to the form values
   */
  mapPropsToStatus?: (props: Props) => any;

  /**
   * Map props to the form touched state
   */
  mapPropsToTouched?: (props: Props) => FormikTouched<Values>;

  /**
   * Map props to the form touched state
   */
  mapPropsToErrors?: (props: Props) => FormikErrors<Values>;

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
  validate?: (values: Values, props: Props) => void | object | Promise<any>;
}

export type CompositeComponent<P> =
  | React.ComponentClass<P>
  | React.StatelessComponent<P>;

export interface ComponentDecorator<TOwnProps, TMergedProps> {
  (component: CompositeComponent<TMergedProps>): React.ComponentType<TOwnProps>;
}

export interface InferableComponentDecorator<TOwnProps> {
  <T extends CompositeComponent<TOwnProps>>(component: T): T;
}

/**
 * A public higher-order component to access the imperative API
 */
export function withFormik<
  OuterProps extends object,
  Values extends FormikValues,
  Payload = Values
>({
  mapPropsToValues = (vanillaProps: OuterProps): Values => {
    let val: Values = {} as Values;
    for (let k in vanillaProps) {
      if (
        vanillaProps.hasOwnProperty(k) &&
        typeof vanillaProps[k] !== 'function'
      ) {
        // @todo TypeScript fix
        (val as any)[k] = vanillaProps[k];
      }
    }
    return val as Values;
  },
  ...config
}: WithFormikConfig<OuterProps, Values, Payload>): ComponentDecorator<
  OuterProps,
  OuterProps & FormikProps<Values>
> {
  return function createFormik(
    Component: CompositeComponent<OuterProps & FormikProps<Values>>
  ): React.ComponentClass<OuterProps> {
    const componentDisplayName =
      Component.displayName ||
      Component.name ||
      (Component.constructor && Component.constructor.name) ||
      'Component';
    /**
     * We need to use closures here for to provide the wrapped component's props to
     * the respective withFormik config methods.
     */
    class C extends React.Component<OuterProps, {}> {
      static displayName = `WithFormik(${componentDisplayName})`;

      validate = (values: Values): void | object | Promise<any> => {
        return config.validate!(values, this.props);
      };

      validationSchema = () => {
        return isFunction(config.validationSchema)
          ? config.validationSchema!(this.props)
          : config.validationSchema;
      };

      handleSubmit = (values: Values, actions: FormikHelpers<Values>) => {
        return config.handleSubmit(values, {
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
        const { children, ...props } = this.props as any;
        return (
          <Formik
            {...props}
            {...config}
            validate={config.validate && this.validate}
            validationSchema={config.validationSchema && this.validationSchema}
            initialValues={mapPropsToValues(this.props)}
            initialStatus={
              config.mapPropsToStatus && config.mapPropsToStatus(this.props)
            }
            initialErrors={
              config.mapPropsToErrors && config.mapPropsToErrors(this.props)
            }
            initialTouched={
              config.mapPropsToTouched && config.mapPropsToTouched(this.props)
            }
            onSubmit={this.handleSubmit as any}
            children={this.renderFormComponent}
          />
        );
      }
    }

    return hoistNonReactStatics(
      C,
      Component as React.ComponentClass<OuterProps & FormikProps<Values>> // cast type to ComponentClass (even if SFC)
    ) as React.ComponentClass<OuterProps>;
  };
}
