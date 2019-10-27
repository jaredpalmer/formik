import * as React from 'react';
import { useFormikContext } from './FormikContext';
import { isFunction, isEmptyChildren, isObject } from './utils';
import invariant from 'tiny-warning';
import { FieldAttributes } from './fieldTypes';

import {
  createConstraints,
  createValidator,
  removeConstraints,
  constraintsToArray,
} from './fieldConstraints';

export function useField<Val = any>(
  propsOrFieldName: string | FieldAttributes<Val>
) {
  const formik = useFormikContext();
  const { getFieldProps, registerField, unregisterField } = formik;
  const isAnObject = isObject(propsOrFieldName);
  const fieldName = isAnObject
    ? (propsOrFieldName as FieldAttributes<Val>).name
    : (propsOrFieldName as string);

  const props: FieldAttributes<Val> = isAnObject
    ? (propsOrFieldName as FieldAttributes<Val>)
    : ({} as FieldAttributes<Val>);
  const constraints = React.useMemo(
    () => createConstraints(props),
    constraintsToArray(props)
  );

  React.useEffect(() => {
    if (fieldName) {
      registerField(fieldName, {
        validate: createValidator(fieldName, constraints),
      });
    }
    return () => {
      if (fieldName) {
        unregisterField(fieldName);
      }
    };
  }, [registerField, unregisterField, fieldName, constraints]);
  if (__DEV__) {
    invariant(
      formik,
      'useField() / <Field /> must be used underneath a <Formik> component or withFormik() higher order component'
    );
  }

  if (isObject(propsOrFieldName)) {
    if (__DEV__) {
      invariant(
        (propsOrFieldName as FieldAttributes<Val>).name,
        'Invalid field name. Either pass `useField` a string or an object containing a `name` key.'
      );
    }
    return getFieldProps(propsOrFieldName);
  }

  return getFieldProps({ name: propsOrFieldName });
}

export function Field(props: FieldAttributes<any>) {
  const {
    validate,
    name,
    render,
    children,
    as: is, // `as` is reserved in typescript lol
    component,
    ...otherProps
  } = removeConstraints(props);
  const {
    validate: _validate,
    validationSchema: _validationSchema,

    ...formik
  } = useFormikContext();

  React.useEffect(() => {
    if (__DEV__) {
      invariant(
        !render,
        `<Field render> has been deprecated and will be removed in future versions of Formik. Please use a child callback function instead. To get rid of this warning, replace <Field name="${name}" render={({field, form}) => ...} /> with <Field name="${name}">{({field, form, meta}) => ...}</Field>`
      );

      invariant(
        !component,
        '<Field component> has been deprecated and will be removed in future versions of Formik. Use <Field as> instead. Note that with the `as` prop, all props are passed directly through and not grouped in `field` object key.'
      );

      invariant(
        !(is && children && isFunction(children)),
        'You should not use <Field as> and <Field children> as a function in the same <Field> component; <Field as> will be ignored.'
      );

      invariant(
        !(component && children && isFunction(children)),
        'You should not use <Field component> and <Field children> as a function in the same <Field> component; <Field component> will be ignored.'
      );

      invariant(
        !(render && children && !isEmptyChildren(children)),
        'You should not use <Field render> and <Field children> in the same <Field> component; <Field children> will be ignored'
      );
    }
    // eslint-disable-next-line
  }, []);

  // construct validators
  const constraints = React.useMemo(
    () => createConstraints(props),
    constraintsToArray(props)
  );

  // Register field and field-level validation with parent <Formik>
  const { registerField, unregisterField } = formik;

  React.useEffect(() => {
    registerField(name, {
      validate: createValidator(name, constraints),
    });
    return () => {
      unregisterField(name);
    };
  }, [registerField, unregisterField, name, constraints]);
  const field = formik.getFieldProps({ name, ...otherProps });
  const meta = formik.getFieldMeta(name);

  const legacyBag = { field, form: formik };

  if (render) {
    return render(legacyBag);
  }

  if (isFunction(children)) {
    return children({ ...legacyBag, meta });
  }

  if (component) {
    // This behavior is backwards compat with earlier Formik 0.9 to 1.x
    if (typeof component === 'string') {
      const { innerRef, ...rest } = otherProps;
      return React.createElement(
        component,
        { ref: innerRef, ...field, ...rest },
        children
      );
    }
    // We don't pass `meta` for backwards compat
    return React.createElement(
      component,
      { field, form: formik, ...otherProps },
      children
    );
  }

  // default to input here so we can check for both `as` and `children` above
  const asElement = is || 'input';

  if (typeof asElement === 'string') {
    const { innerRef, ...rest } = otherProps;
    return React.createElement(
      asElement,
      { ref: innerRef, ...field, ...rest },
      children
    );
  }

  return React.createElement(asElement, { ...field, ...otherProps }, children);
}
