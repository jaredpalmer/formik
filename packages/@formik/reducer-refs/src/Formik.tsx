import * as React from 'react';
import {
  FormikConfig,
  FormikValues,
  FormikProps,
  isFunction,
  isEmptyChildren,
} from '@formik/core';
import invariant from 'tiny-warning';
import { useFormik } from './hooks/useFormik';
import { FormikApiContext } from './contexts/FormikApiContext';

export function Formik<
  Values extends FormikValues = FormikValues,
  ExtraProps = {}
>(props: FormikConfig<Values> & ExtraProps) {
  // now hear me out. this is wrong, I know.
  // useFormik now returns a bag of stable api methods
  // so lets never update it again
  // this is a PROTOTYPE
  const { current: formikApi } = React.useRef(useFormik<Values>(props));
  const [formikState, setFormikState] = React.useState(formikApi.getState());

  const { component, children, render, innerRef } = props;

  // This allows folks to pass a ref to the Formik API
  React.useImperativeHandle(innerRef, () => formikApi);

  const formikBag: FormikProps<Values> = {
    ...formikApi,
    ...formikState,
  }

  React.useEffect(() => {
    // conditionally add a form effect when the formikBag is needed
    if (component || render || isFunction(children)) {
      return formikApi.addFormEffect(setFormikState);
    }

    return;
  }, [component, render, children]);

  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      invariant(
        !props.render,
        `<Formik render> has been deprecated and will be removed in future versions of Formik. Please use a child callback function instead. To get rid of this warning, replace <Formik render={(props) => ...} /> with <Formik>{(props) => ...}</Formik>`
      );
      // eslint-disable-next-line
    }, []);
  }
  return (
    <FormikApiContext.Provider value={formikApi}>
      {component
        ? React.createElement(component as any, formikBag)
        : render
        ? render(formikBag)
        : children // children come last, always called
        ? isFunction(children)
          ? children(formikBag)
          : !isEmptyChildren(children)
          ? React.Children.only(children)
          : null
        : null}
    </FormikApiContext.Provider>
  );
}
