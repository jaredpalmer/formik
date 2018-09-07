import * as React from 'react';
import {
  FormikActions,
  FormikProps,
  FormikSharedConfig,
  FormikValues,
} from './types';
export declare type InjectedFormikProps<Props, Values> = Props &
  FormikProps<Values>;
export declare type FormikBag<P, V> = {
  props: P;
} & FormikActions<V>;
export interface WithFormikConfig<
  Props,
  Values extends FormikValues = FormikValues,
  DeprecatedPayload = Values
> extends FormikSharedConfig {
  displayName?: string;
  handleSubmit: (values: Values, formikBag: FormikBag<Props, Values>) => void;
  mapPropsToValues?: (props: Props) => Values;
  mapValuesToPayload?: (values: Values) => DeprecatedPayload;
  validationSchema?: any | ((props: Props) => any);
  validate?: (values: Values, props: Props) => void | object | Promise<any>;
}
export declare type CompositeComponent<P> =
  | React.ComponentClass<P>
  | React.StatelessComponent<P>;
export interface ComponentDecorator<TOwnProps, TMergedProps> {
  (component: CompositeComponent<TMergedProps>): React.ComponentType<TOwnProps>;
}
export interface InferableComponentDecorator<TOwnProps> {
  <T extends CompositeComponent<TOwnProps>>(component: T): T;
}
export declare function withFormik<
  OuterProps,
  Values extends FormikValues,
  Payload = Values
>({
  mapPropsToValues,
  ...config
}: WithFormikConfig<OuterProps, Values, Payload>): ComponentDecorator<
  OuterProps,
  OuterProps & FormikProps<Values>
>;
