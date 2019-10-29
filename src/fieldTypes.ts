import {
  FormikProps,
  GenericFieldHTMLAttributes,
  FieldMetaProps,
  FieldInputProps,
  FieldValidator,
} from './types';

export interface FieldProps<V = any> {
  field: FieldInputProps<V>;
  form: FormikProps<V>; // if ppl want to restrict this for a given form, let them.
  meta: FieldMetaProps<V>;
}

export interface FieldConstraints {
  required?: boolean | [boolean, string];
  minLength?: number | [number, string];
  maxLength?: number | [number, string];
  numeric?: boolean | [boolean, string];
  min?: number | [number, string];
  max?: number | [number, string];
  equal?: any | [any, string];
  isEmail?: boolean | [boolean, string];
  match?: string | [string, string];

  /**
   * Validate a single field value independently
   */
  validate?: FieldValidator;
}

export interface FieldConfig extends FieldConstraints {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   * @deprecated
   */
  component?:
    | keyof JSX.IntrinsicElements
    | React.ComponentType<FieldProps<any>>
    | React.ComponentType;

  /**
   * Component to render. Can either be a string e.g. 'select', 'input', or 'textarea', or a component.
   */
  as?:
    | React.ComponentType<FieldProps<any>['field']>
    | keyof JSX.IntrinsicElements
    | React.ComponentType;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   * @deprecated
   */
  render?: (props: FieldProps<any>) => React.ReactNode;

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?: ((props: FieldProps<any>) => React.ReactNode) | React.ReactNode;

  /**
   * Field name
   */
  name: string;

  /** HTML input type */
  type?: string;

  /** Field value */
  value?: any;

  /** Inner ref */
  innerRef?: (instance: any) => void;
}

export type FieldAttributes<T> = GenericFieldHTMLAttributes &
  FieldConfig &
  T & { name: string };
