import * as React from 'react';
import { FormikProps, GenericFieldHTMLAttributes } from './types';
import { useFormikContext } from './FormikContext';
import { isFunction } from './utils';

/**
 * Note: These typings could be more restrictive, but then it would limit the
 * reusability of custom <Field/> components.
 *
 * @example
 * interface MyProps {
 *   ...
 * }
 *
 * export const MyInput: React.SFC<MyProps & FieldProps> = ({
 *   field,
 *   form,
 *   ...props
 * }) =>
 *   <div>
 *     <input {...field} {...props}/>
 *     {form.touched[field.name] && form.errors[field.name]}
 *   </div>
 */
export interface FieldProps<V = any> {
  field: {
    /** Classic React change handler, keyed by input name */
    onChange: (e: React.ChangeEvent<any>) => void;
    /** Mark input as touched */
    onBlur: (e: any) => void;
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
   */
  component?:
    | string
    | React.ComponentType<FieldProps<any>>
    | React.ComponentType<void>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
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

  return formik.getFieldProps(name, type);
}

export function Field({
  validate,
  name,
  render,
  children,
  component = 'input',
  ...props
}: FieldAttributes<any>) {
  const {
    validate: _validate,
    validationSchema: _validationSchema,
    ...formik
  } = useFormikContext();
  React.useEffect(
    () => {
      formik.registerField(props.name, {
        validate: props.validate,
      });
      return () => {
        formik.unregisterField(props.name);
      };
    },
    [props.name, props.validate]
  );
  const [field] = formik.getFieldProps(name, props.type);
  const bag = { field, form: formik };

  if (render) {
    return render(bag);
  }

  if (isFunction(children)) {
    return children(bag);
  }

  if (typeof component === 'string') {
    const { innerRef, ...rest } = props;
    return React.createElement(component, {
      ref: innerRef,
      ...field,
      ...rest,
      children,
    });
  }

  return React.createElement(component, {
    ...bag,
    ...props,
    children,
  });
}
export const FastField = Field;
// export const FastField = (React as any).memo(
//   connect(
//     ({
//       formik: _formik,
//       ...props
//     }: FieldAttributes<any> & { formik: FormikCtx<any> }) => {
//       console.log(props['data-testid']);
//       return <Field {...props} />;
//     }
//   ),
//   (props: any, nextProps: any) => {
//     return (
//       Object.keys(nextProps).length === Object.keys(props).length ||
//       props.formik.isSubmitting === nextProps.formik.isSubmitting ||
//       props === nextProps ||
//       getIn(nextProps.formik.values, nextProps.name) ===
//         getIn(props.formik.values, nextProps.name) ||
//       getIn(nextProps.formik.errors, nextProps.name) ===
//         getIn(props.formik.errors, nextProps.name) ||
//       getIn(nextProps.formik.touched, nextProps.name) ===
//         getIn(props.formik.touched, nextProps.name)
//     );
//   }
// );
