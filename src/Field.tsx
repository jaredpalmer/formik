import * as React from 'react';
import { FormikConsumer } from './connect';
import {
  FormikProps,
  GenericFieldHTMLAttributes,
  FormikContext,
} from './types';
import { getIn, isFunction, isPromise, warnRenderProps } from './utils';

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

export interface FieldConfig<ExtraProps> {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?:
    | string
    | React.ComponentType<ExtraProps & FieldProps<any>>
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

export namespace FieldInner {
  export type Props<ExtraProps, Values> = ExtraProps &
    Field.Props<ExtraProps> & { formik: FormikContext<Values> };
  export type State = {};
}

/**
 * Custom Field component for quickly hooking into Formik
 * context and wiring up forms.
 */
class FieldInner<ExtraProps, Values> extends React.Component<
  FieldInner.Props<ExtraProps, Values>,
  FieldInner.State
> {
  constructor(props: FieldInner.Props<ExtraProps, Values>) {
    super(props);
    warnRenderProps('Field', props, 'component');

    // Register the Field with the parent Formik. Parent will cycle through
    // registered Field's validate fns right prior to submit
    props.formik.registerField(props.name, {
      validate: props.validate,
    });
  }

  componentDidUpdate(prevProps: FieldInner.Props<ExtraProps, Values>) {
    if (this.props.name !== prevProps.name) {
      this.props.formik.unregisterField(prevProps.name);
      this.props.formik.registerField(this.props.name, {
        validate: this.props.validate,
      });
    }

    if (this.props.validate !== prevProps.validate) {
      this.props.formik.registerField(this.props.name, {
        validate: this.props.validate,
      });
    }
  }

  componentWillUnmount() {
    this.props.formik.unregisterField(this.props.name);
  }

  handleChange = (e: React.ChangeEvent<any>) => {
    const { handleChange, validateOnChange } = this.props.formik;
    handleChange(e); // Call Formik's handleChange no matter what
    if (!!validateOnChange && !!this.props.validate) {
      this.runFieldValidations(e.target.value);
    }
  };

  handleBlur = (e: any) => {
    const { handleBlur, validateOnBlur } = this.props.formik;
    handleBlur(e); // Call Formik's handleBlur no matter what
    if (!!validateOnBlur && !!this.props.validate) {
      this.runFieldValidations(e.target.value);
    }
  };

  runFieldValidations = (value: any) => {
    const { setFieldError } = this.props.formik;
    const { name, validate } = this.props;
    // Call validate fn
    const maybePromise = (validate as any)(value);
    // Check if validate it returns a Promise
    if (isPromise(maybePromise)) {
      maybePromise.then(
        () => setFieldError(name, undefined),
        error => setFieldError(name, error)
      );
    } else {
      // Otherwise set the error
      setFieldError(name, maybePromise);
    }
  };

  render() {
    const {
      validate,
      name,
      render,
      children,
      component = 'input',
      formik,
      ...props
    } = (this.props as FieldInner.Props<ExtraProps, Values>) as any;
    const {
      validate: _validate,
      validationSchema: _validationSchema,
      ...restOfFormik
    } = formik;
    const field = {
      value:
        props.type === 'radio' || props.type === 'checkbox'
          ? props.value // React uses checked={} for these inputs
          : getIn(formik.values, name),
      name,
      onChange: validate ? this.handleChange : formik.handleChange,
      onBlur: validate ? this.handleBlur : formik.handleBlur,
    };
    const bag = { field, form: restOfFormik };

    if (render) {
      return (render as any)(bag);
    }

    if (isFunction(children)) {
      return (children as (props: FieldProps<any>) => React.ReactNode)(bag);
    }

    if (typeof component === 'string') {
      const { innerRef, ...rest } = props;
      return React.createElement(component as any, {
        ref: innerRef,
        ...field,
        ...rest,
        children,
      });
    }

    return React.createElement(component as any, {
      ...bag,
      ...props,
      children,
    });
  }
}

export namespace Field {
  export type Props<ExtraProps> = ExtraProps &
    GenericFieldHTMLAttributes &
    FieldConfig<ExtraProps>;
  export type State = {};
}

export class Field<ExtraProps, Values> extends React.Component<
  Field.Props<ExtraProps>,
  Field.State
> {
  static WrappedComponent = FieldInner;

  render() {
    return (
      <FormikConsumer<Values>>
        {formik => (
          <FieldInner<ExtraProps, Values>
            {...this.props as Field.Props<ExtraProps>}
            formik={formik}
          />
        )}
      </FormikConsumer>
    );
  }
}
