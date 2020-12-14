import * as React from 'react';
import {
  FormikConfig,
  FormikValues,
  FormikProps,
  isFunction,
  isEmptyChildren,
} from '@formik/core';
import { FormikProvider } from './FormikContext';
import invariant from 'tiny-warning';
import { useFormik } from './useFormik';
import { FormikApiContext } from './FormikApiContext';

export function Formik<
  Values extends FormikValues = FormikValues,
  ExtraProps = {}
>(props: FormikConfig<Values> & ExtraProps) {
  const formikApi = useFormik<Values>(props);
  const [formikState, setFormikState] = React.useState(formikApi.getState());
  
  React.useEffect(() => {
    return formikApi.addFormEffect(setFormikState);
  }, []);

  const formikBag: FormikProps<Values> = {
    ...formikApi,
    ...formikState,
  }

  const { component, children, render, innerRef } = props;

  // This allows folks to pass a ref to <Formik />
  React.useImperativeHandle(innerRef, () => formikBag);

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
      <FormikProvider value={formikBag}>
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
        </FormikProvider>
    </FormikApiContext.Provider>
  );
}
