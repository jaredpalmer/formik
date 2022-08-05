import * as React from 'react';
import { FieldMetaProps, FormikContextType, FormikEvents } from './types';
import { getIn, isFunction } from './utils';
import { connect } from './connect';
import isEqual from 'react-fast-compare';

export interface ErrorMessageProps {
  name: string;
  className?: string;
  component?: string | React.ComponentType;
  children?: (errorMessage: string) => React.ReactNode;
  render?: (errorMessage: string) => React.ReactNode;
}

type ErrorMessageState<Value> = Pick<
  FieldMetaProps<Value>,
  'error' | 'touched'
>;

class ErrorMessageImpl extends React.Component<
  ErrorMessageProps & { formik: FormikContextType<any> },
  ErrorMessageState<any>
> {
  unsubscribe = () => {};

  constructor(props: ErrorMessageProps & { formik: FormikContextType<any> }) {
    super(props);

    const { errors, touched } = props.formik;
    this.state = {
      error: getIn(errors, props.name),
      touched: !!getIn(touched, props.name),
    };
  }

  componentDidMount() {
    this.unsubscribe = this.props.formik.eventManager.on(
      FormikEvents.stateUpdate,
      formikState => {
        const state = {
          error: getIn(formikState.errors, this.props.name),
          touched: !!getIn(formikState.touched, this.props.name),
        };
        if (!isEqual(this.state, state)) {
          this.setState(state);
        }
      }
    );
  }

  componentWillUnmount() {
    this.unsubscribe();
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
