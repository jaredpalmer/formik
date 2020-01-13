import * as React from 'react';
import { FormikContextType } from './types';
import { getIn, isFunction } from './utils';
import { connect } from './connect';

export interface ErrorMessageProps {
  name: string;
  className?: string;
  component?: string | React.ComponentType;
  children?: (errorMessage: string) => React.ReactNode;
  render?: (errorMessage: string) => React.ReactNode;
}

class ErrorMessageImpl extends React.Component<
  ErrorMessageProps & { formik: FormikContextType<any> }
> {
  shouldComponentUpdate(
    props: ErrorMessageProps & { formik: FormikContextType<any> }
  ) {
    if (
      getIn(this.props.formik.errors, this.props.name) !==
        getIn(props.formik.errors, this.props.name) ||
      getIn(this.props.formik.touched, this.props.name) !==
        getIn(props.formik.touched, this.props.name) ||
      Object.keys(this.props).length !== Object.keys(props).length
    ) {
      return true;
    } else {
      return false;
    }
  }

  render() {
    let { component, formik, render, children, name, ...rest } = this.props;

    const touch = getIn(formik.touched, name);
    const error = getIn(formik.errors, name);

    return !!touch && !!error
      ? render
        ? isFunction(render)
          ? render(error)
          : null
        : children
        ? isFunction(children)
          ? children(error)
          : null
        : component
        ? React.createElement(component, rest as any, error)
        : error
      : null;
  }
}

export const ErrorMessage = connect<
  ErrorMessageProps,
  ErrorMessageProps & { formik: FormikContextType<any> }
>(ErrorMessageImpl);
