import * as React from 'react';
import {
  isFunction,
  isEmptyChildren,
} from '@formik/core';
import invariant from 'tiny-warning';
import { useFormikApi } from '../hooks/useFormikApi';
import { FieldAttributes, useField } from '../hooks/useField';

export function Field(rawProps: FieldAttributes<any>) {
  const {
    render,
    children,
    as: is, // `as` is reserved in typescript lol
    component,
    ...props
  } = rawProps;

  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      invariant(
        !render,
        `<Field render> has been deprecated and will be removed in future versions of Formik. Please use a child callback function instead. To get rid of this warning, replace <Field name="${rawProps.name}" render={({field, form}) => ...} /> with <Field name="${rawProps.name}">{({field, form, meta}) => ...}</Field>`
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
      // eslint-disable-next-line
    }, []);
  }

  const formik = useFormikApi();
  const [field, meta] = useField(props);

  const legacyBag = { field, form: formik };



  if (render) {
    return render({ ...legacyBag, meta });
  }

  if (isFunction(children)) {
    return children({ ...legacyBag, meta });
  }

  if (component) {
    // This behavior is backwards compat with earlier Formik 0.9 to 1.x
    if (typeof component === 'string') {
      const { innerRef, ...rest } = props;
      return React.createElement(
        component,
        { ref: innerRef, ...field, ...rest },
        children
      );
    }
    // We don't pass `meta` for backwards compat
    return React.createElement(
      component,
      { field, form: formik, ...props },
      children
    );
  }

  // default to input here so we can check for both `as` and `children` above
  const asElement = is || 'input';

  if (typeof asElement === 'string') {
    const { innerRef, ...rest } = props;
    return React.createElement(
      asElement,
      { ref: innerRef, ...field, ...rest },
      children
    );
  }

  return React.createElement(asElement, { ...field, ...props }, children);
}
