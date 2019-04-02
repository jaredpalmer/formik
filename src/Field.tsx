import * as React from 'react';
import {
  FormikProps,
  GenericFieldHTMLAttributes,
  FormikHandlers,
} from './types';
import { useFormikContext } from './FormikContext';
import { isFunction, isEmptyChildren } from './utils';
import warning from 'tiny-warning';

export interface FieldProps<V = any> {
  field: {
    /** Classic React change handler, keyed by input name */
    onChange: FormikHandlers['handleChange'];
    /** Mark input as touched */
    onBlur: FormikHandlers['handleBlur'];
    /** Value of the input */
    value: any;
    /* name of the input */
    name: string;
  };
  form: FormikProps<V>; // if ppl want to restrict this for a given form, let them.
}

export interface FieldConfig {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   * @deprecated
   */
  component?:
    | string
    | React.ComponentType<FieldProps<any>>
    | React.ComponentType<void>;

  /**
   * Component to render. Can either be a string like 'select' or a component.
   */
  as?:
    | string
    | React.ComponentType<FieldProps<any>['field']>
    | React.ComponentType<void>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   * @deprecated
   */
  render?: ((props: FieldProps<any>) => React.ReactNode);

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?: ((props: FieldProps<any>) => React.ReactNode) | React.ReactNode;

  /**
   * Validate a single field value independently
   */
  validate?: ((value: any) => string | Promise<void> | undefined);

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

export type FieldAttributes<T> = GenericFieldHTMLAttributes & FieldConfig & T;

export function useField(name: string, type?: string) {
  const formik = useFormikContext();

  if (process.env.NODE_ENV !== 'production') {
    warning(
      formik,
      'useField() / <Field /> must be used underneath a <Formik> component or withFormik() higher order component'
    );
  }

  return formik.getFieldProps(name, type);
}

export function Field({
  validate,
  name,
  render,
  children,
  as: is = 'input', // `as` is reserved in typescript lol
  component,
  ...props
}: FieldAttributes<any>) {
  const {
    validate: _validate,
    validationSchema: _validationSchema,
    ...formik
  } = useFormikContext();

  warning(
    !!render,
    `<Field render> has been deprecated and will be removed in future versions of Formik. Please use a child callback function instead. To get rid of this warning, 
        replace 
          <Field name="${name}" render={({field, form}) => ...} />
        with
          <Field name="${name}">{({field, form}) => ...}</Field>
    `
  );

  warning(
    !!component,
    '<Field component> has been deprecated and will be removed in future versions of Formik. Use <Formik as> instead. Note that with the `as` prop, all props are passed directly through and not grouped in `field` object key.'
  );

  warning(
    !!is && !!children && isFunction(children),
    'You should not use <Field as> and <Field children> as a function in the same <Field> component; <Field as> will be ignored.'
  );

  warning(
    !!component && children && isFunction(children),
    'You should not use <Field as> and <Field children> as a function in the same <Field> component; <Field as> will be ignored.'
  );

  warning(
    !!render && !!children && !isEmptyChildren(children),
    'You should not use <Field render> and <Field children> in the same <Field> component; <Field children> will be ignored'
  );

  React.useEffect(
    () => {
      formik.registerField(name, {
        validate: validate,
      });
      return () => {
        formik.unregisterField(name);
      };
    },
    [name, validate]
  );
  const [field] = formik.getFieldProps(name, props.type);
  const bag = { field, form: formik };

  if (render) {
    return render(bag);
  }

  if (isFunction(children)) {
    return children(bag);
  }

  if (component) {
    if (typeof component === 'string') {
      const { innerRef, ...rest } = props;
      return React.createElement(
        component,
        { ref: innerRef, ...field, ...rest },
        children
      );
    }
    return React.createElement(component, { ...bag, ...props }, children);
  }

  if (typeof is === 'string') {
    const { innerRef, ...rest } = props;
    return React.createElement(
      is,
      { ref: innerRef, ...field, ...rest },
      children
    );
  }

  return React.createElement(is, { ...field, ...props }, children);
}
export const FastField = Field;
