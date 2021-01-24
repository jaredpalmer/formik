import * as React from 'react';
import {
  FormikConfig,
  FormikValues,
  FormikProps,
  isFunction,
  isEmptyChildren,
} from '@formik/core';
import invariant from 'tiny-warning';
import { useFormik } from '../hooks/useFormik';
import { FormikApiContext } from '../contexts/FormikApiContext';
import { FormikRefState } from '../types';
import { useFullFormikState } from '../hooks/useFullFormikState';

export function Formik<
  Values extends FormikValues = FormikValues,
  ExtraProps = {}
>(props: FormikConfig<Values, FormikRefState<Values>> & ExtraProps) {
  const { component, children, render, innerRef } = props;

  // get state and add a form effect if render or child function is used
  // aka, we need to pass FormikState directly
  // also component, because it is documented that way
  const formikApi = useFormik<Values>(props);
  const formikState = useFullFormikState(
    formikApi,
    !!component || !!render || isFunction(children)
  );

  // This allows folks to pass a ref to the Formik API
  React.useImperativeHandle(innerRef, () => formikApi);

  const formikBag: FormikProps<Values> = {
    ...formikApi,
    ...formikState,
  };

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
        ? React.createElement(component, formikBag)
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
