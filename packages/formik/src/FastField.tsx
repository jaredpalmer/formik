import * as React from 'react';
import {
  FieldInputProps,
  FieldMetaProps,
  GenericFieldHTMLAttributes,
  isEmptyChildren,
  isFunction,
} from '@formik/core';
import invariant from 'tiny-warning';
import { useField, UseFieldProps } from './hooks';

export type FastFieldProps<FieldValue = any> = {
  field: FieldInputProps<FieldValue>;
  meta: FieldMetaProps<FieldValue>;
};

export interface FastFieldRenderProps<Value = any> {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?: string | React.ComponentType<FastFieldProps<Value>>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   * @deprecated
   */
  render?: (props: FastFieldProps<Value>) => React.ReactNode;

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?:
    | ((props: FastFieldProps<Value>) => React.ReactNode)
    | React.ReactNode;

  /** Inner ref */
  innerRef?: (instance: any) => void;
}

export type FastFieldConfig<V = any> = UseFieldProps<V> &
  FastFieldRenderProps<V> & {
    /**
     * Override FastField's default shouldComponentUpdate
     * @deprecated
     */
    shouldUpdate?: (nextProps: any, props: {}) => boolean;
  };

export function FastField<V = any>({
  render,
  children,
  as: is, // `as` is reserved in typescript lol
  component,
  shouldUpdate,
  ...props
}: GenericFieldHTMLAttributes & FastFieldConfig<V>): any {
  React.useEffect(() => {
    invariant(
      !render,
      `<FastField render> has been deprecated. Please use a child callback function instead: <FastField name={${name}}>{props => ...}</FastField> instead.`
    );
    invariant(
      !(component && render),
      'You should not use <FastField component> and <FastField render> in the same <FastField> component; <FastField component> will be ignored'
    );

    invariant(
      !(is && children && isFunction(children)),
      'You should not use <FastField as> and <FastField children> as a function in the same <FastField> component; <FastField as> will be ignored.'
    );

    invariant(
      !(component && children && isFunction(children)),
      'You should not use <FastField component> and <FastField children> as a function in the same <FastField> component; <FastField component> will be ignored.'
    );

    invariant(
      !(render && children && !isEmptyChildren(children)),
      'You should not use <FastField render> and <FastField children> in the same <FastField> component; <FastField children> will be ignored'
    );
    invariant(
      !shouldUpdate,
      `<FastField shouldUpdate> has been deprecated. Please create a custom component with useField and React.memo() instead.`
    );
    // eslint-disable-next-line
  }, []);

  const [field, meta] = useField<V>(props);

  if (render) {
    // @ts-ignore @todo types
    return isFunction(render) ? render({ field, meta }) : null;
  }

  if (isFunction(children)) {
    // @ts-ignore @todo types
    return children({ field, meta });
  }

  const { parse, format, formatOnBlur, validate, onChange, ...rest } = props;

  if (component) {
    // This behavior is backwards compat with earlier Formik 0.9 to 1.x
    if (typeof component === 'string') {
      const { innerRef, ...stringRest } = rest;
      return React.createElement(
        component,
        { ref: innerRef, ...field, ...stringRest },
        children
      );
    }
    return React.createElement(component, { field, meta, ...rest }, children);
  }

  // default to input here so we can check for both `as` and `children` above
  const asElement = is || 'input';

  if (typeof asElement === 'string') {
    const { innerRef, ...stringRest } = rest;
    return React.createElement(
      asElement,
      { ref: innerRef, ...field, ...stringRest },
      children
    );
  }
  return React.createElement(
    asElement as React.FunctionComponent<FieldInputProps<V>>,
    { ...field, ...rest },
    children
  );
}
