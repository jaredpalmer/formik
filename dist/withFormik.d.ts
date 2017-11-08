/// <reference types="react" />
import * as React from 'react';
import {
  FormikActions,
  FormikComputedProps,
  FormikHandlers,
  FormikSharedConfig,
  FormikState,
  FormikValues,
} from './formik';
export declare type InjectedFormikProps<Props, Values> = Props &
  FormikState<Values> &
  FormikActions<Values> &
  FormikHandlers &
  FormikComputedProps<Values>;
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
  validate?: (values: any, props: Props) => void | object | Promise<any>;
}
export declare type CompositeComponent<P> =
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
export declare function withFormik<
  Props,
  Values extends FormikValues,
  Payload = Values
>({
  mapPropsToValues,
  ...config,
}: WithFormikConfig<Props, Values, Payload>): ComponentDecorator<
  Props,
  InjectedFormikProps<Props, Values>
>
