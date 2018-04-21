/* @flow */

import * as React from 'react';
import type { FormikActions } from '../../dist/formik';

type State = {
  error: ?string,
};

type ApiError = {|
  +key: string,
  +message: string,
|};

// Move all server errors we can show on formik into formik compatible errors object,
// Move all others into error string
function parseErrors<T: {}>(
  errs: Array<ApiError>,
  values: T
): { errors: { [$Keys<T>]: ?string }, error: ?string } {
  return {
    errors: errs.reduce((r, err) => {
      if (err.key in values) {
        return { [err.key]: err.message, ...r };
      }
      return r;
    }, {}),
    error: errs
      .filter(err => !(err.key in values))
      .map(err => err.message)
      .join('\n'),
  };
}

export default class Mutation<InputData: {}> extends React.Component<
  {|
    +mutation: (data: InputData, (errs: ?Array<ApiError>) => void) => void,

    +children: ({|
      onSubmit: <T: {}>(
        input: InputData,
        values: T,
        formikActions: FormikActions<T>
      ) => void,
      onResetError: () => void,
      error: ?string,
    |}) => React.Node,
  |},
  State
> {
  static contextTypes = {
    relay: () => {},
  };

  context: {
    relay: {
      environment: mixed,
    },
  };

  state = {
    error: null,
  };

  isMounted_ = false;

  updateState = (obj: $Shape<State>) => {
    if (this.isMounted_) {
      this.setState(obj);
    }
  };

  handleResetError = () => {
    this.setState({ error: null });
  };

  handleSubmit: <T: {}>(
    input: InputData,
    values: T,
    formikActions: FormikActions<T>
  ) => void = (input, values, { setErrors, resetForm, setSubmitting }) => {
    const environment = this.context.relay.environment;
    const { mutation } = this.props;

    setSubmitting(true);

    mutation(input, errs => {
      if (errs) {
        setSubmitting(false);

        const { error, errors } = parseErrors(errs, values);

        if (errors) {
          setErrors(errors);
        }
        this.updateState({ error });
      } else {
        setSubmitting(false);

        this.updateState({ error: null });
        resetForm();
      }
    });
  };

  render() {
    const {
      handleSubmit: onSubmit,
      handleResetError: onResetError,
      state: { error },
      props: { children },
    } = this;

    return children({
      onSubmit,
      onResetError,
      error,
    });
  }

  componentDidMount() {
    this.isMounted_ = true;
  }

  componentWillUnmount() {
    this.isMounted_ = false;
  }
}
