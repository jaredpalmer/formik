import * as React from 'react';
import { FormikProps, GenericFieldHTMLAttributes } from './types';
export interface FieldProps<V = any> {
  field: {
    onChange: (e: React.ChangeEvent<any>) => void;
    onBlur: (e: any) => void;
    value: any;
    name: string;
  };
  form: FormikProps<V>;
}
export interface FieldConfig {
  component?:
    | string
    | React.ComponentType<FieldProps<any>>
    | React.ComponentType<void>;
  render?: ((props: FieldProps<any>) => React.ReactNode);
  children?: ((props: FieldProps<any>) => React.ReactNode) | React.ReactNode;
  validate?: ((value: any) => string | Promise<void> | undefined);
  name: string;
  type?: string;
  value?: any;
  innerRef?: (instance: any) => void;
}
export declare type FieldAttributes<T> = GenericFieldHTMLAttributes &
  FieldConfig &
  T;
export declare const Field: React.ComponentClass<any> & {
  WrappedComponent: React.ComponentClass<any>;
};
