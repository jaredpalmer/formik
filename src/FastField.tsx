import * as React from 'react';
import invariant from 'tiny-warning';
import { FieldConfig } from './Field';
import { FormikContext } from './FormikContext';
import {
  FieldInputProps,
  FieldMetaProps,
  FormikProps,
  GenericFieldHTMLAttributes,
} from './types';
import { getIn, isEmptyChildren, isFunction } from './utils';

type $FixMe = any;

export interface FastFieldProps<V = any> {
  field: FieldInputProps<V>;
  meta: FieldMetaProps<V>;
  form: FormikProps<V>; // if ppl want to restrict this for a given form, let them.
}

export type FastFieldConfig<T> = FieldConfig & {
  /** Override FastField's default shouldComponentUpdate */
  shouldUpdate?: (
    nextProps: T & GenericFieldHTMLAttributes,
    props: {}
  ) => boolean;
};

export type FastFieldAttributes<T> = GenericFieldHTMLAttributes &
  FastFieldConfig<T> &
  T;

/**
 * Custom Field component for quickly hooking into Formik
 * context and wiring up forms.
 */
export const FastField = React.memo(
  <Props extends Record<string, any> = {}>(props: FastFieldConfig<Props>) => {
    const {
      validate,
      name,
      render,
      as: is,
      children,
      component,
      shouldUpdate,
      ..._props
    } = props;
    const formik = React.useContext(FormikContext);

    React.useEffect(() => {
      const { name, validate } = props;

      // Register the Field with the parent Formik. Parent will cycle through
      // registered Field's validate fns right prior to submit
      formik.registerField(name, { validate });
      return () => formik.unregisterField(name);
    }, []);

    React.useEffect(() => {
      const { render, children, component, as: is, name } = props;

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
    }, []);

    return React.useMemo(
      () => {
        const {
          validate: _validate,
          validationSchema: _validationSchema,
          ...form
        } = formik;

        const field = {
          value:
            _props.type === 'radio' || _props.type === 'checkbox'
              ? _props.value // React uses checked={} for these inputs
              : getIn(formik.values, name),
          name,
          onChange: formik.handleChange,
          onBlur: formik.handleBlur,
        };

        const meta = {
          value: getIn(formik.values, name),
          error: getIn(formik.errors, name),
          touched: !!getIn(formik.touched, name),
          initialValue: getIn(formik.initialValues, name),
          initialTouched: !!getIn(formik.initialTouched, name),
          initialError: getIn(formik.initialErrors, name),
        };

        const bag: FastFieldProps = { field, meta, form };

        if (render && isFunction(render)) {
          return render(bag) as React.ReactElement;
        }

        if (isFunction(children)) {
          return children(bag) as React.ReactElement;
        }

        if (component) {
          // This behavior is backwards compat with earlier Formik 0.9 to 1.x
          if (typeof component === 'string') {
            const { innerRef, ...rest } = _props;
            return React.createElement(
              component,
              { ref: innerRef, ...field, ...rest },
              children
            );
          }
          // We don't pass `meta` for backwards compat
          return React.createElement(
            component as React.ComponentType<$FixMe>,
            { field, form: formik, ..._props },
            children
          );
        }

        // default to input here so we can check for both `as` and `children` above
        const asElement = is || 'input';

        if (typeof asElement === 'string') {
          const { innerRef, ...rest } = _props;
          return React.createElement(
            asElement,
            { ref: innerRef, ...field, ...(rest as $FixMe) },
            children
          );
        }

        return React.createElement(
          asElement as React.ComponentType<FieldInputProps<$FixMe>>,
          { ...field, ..._props },
          children
        );
      },
      isFunction(props.shouldUpdate)
        ? undefined
        : [
            getIn(formik.values, name),
            getIn(formik.errors, name),
            getIn(formik.touched, name),
            Object.keys(_props).length,
            formik.isSubmitting,
          ]
    );
  },
  (previous, next) => {
    const propsAreEqual = previous === next;
    if (propsAreEqual && isFunction(previous.shouldUpdate)) {
      return !previous.shouldUpdate(previous, next); // true/false values are inversed here since we need return false if we want to update
    } else {
      return propsAreEqual;
    }
  }
);
