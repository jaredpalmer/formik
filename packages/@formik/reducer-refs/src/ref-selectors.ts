import {
  AnyDispatch,
  FieldMetaProps,
  FormikConfig,
  FormikHelpers,
  FormikState,
  FormikValues,
  getIn,
  isPromise,
} from '@formik/core';
import { FormikRefState, GetRefStateFn } from './types';

export const selectRefResetForm = <Values extends FormikValues>(
  getState: GetRefStateFn<Values>,
  dispatch: AnyDispatch<Values>,
  initialErrors: FormikConfig<Values, FormikRefState<Values>>['initialErrors'],
  initialTouched: FormikConfig<
    Values,
    FormikRefState<Values>
  >['initialTouched'],
  initialStatus: FormikConfig<Values, FormikRefState<Values>>['initialStatus'],
  onReset: FormikConfig<Values, FormikRefState<Values>>['onReset'],
  imperativeMethods: FormikHelpers<Values, FormikRefState<Values>>
) => (nextState?: Partial<FormikState<Values>>) => {
  const values =
    nextState && nextState.values ? nextState.values : getState().initialValues;
  const errors =
    nextState && nextState.errors
      ? nextState.errors
      : getState().initialErrors
      ? getState().initialErrors
      : initialErrors ?? {};
  const touched =
    nextState && nextState.touched
      ? nextState.touched
      : getState().initialTouched
      ? getState().initialTouched
      : initialTouched || {};
  const status =
    nextState && nextState.status
      ? nextState.status
      : getState().initialStatus
      ? getState().initialStatus
      : initialStatus;

  const dispatchFn = () => {
    dispatch({
      type: 'RESET_FORM',
      payload: {
        initialValues: values,
        initialErrors: errors,
        initialTouched: touched,
        initialStatus: status,
        values,
        errors,
        touched,
        status,
        isSubmitting: !!nextState && !!nextState.isSubmitting,
        isValidating: !!nextState && !!nextState.isValidating,
        submitCount:
          !!nextState &&
          !!nextState.submitCount &&
          typeof nextState.submitCount === 'number'
            ? nextState.submitCount
            : 0,
        dirty: false,
      },
    });
  };

  if (onReset) {
    const maybePromisedOnReset = onReset(getState().values, imperativeMethods);

    if (isPromise(maybePromisedOnReset)) {
      maybePromisedOnReset.then(dispatchFn);
    } else {
      dispatchFn();
    }
  } else {
    dispatchFn();
  }
};

export const selectFieldMetaByName = (name: string) => <
  Values,
  State extends FormikRefState<Values>
>(
  state: State
) => ({
  value: getIn(state.values, name),
  error: getIn(state.errors, name),
  touched: !!getIn(state.touched, name),
  initialValue: getIn(state.initialValues, name),
  initialTouched: !!getIn(state.initialTouched, name),
  initialError: getIn(state.initialErrors, name),
});

export const selectRefGetFieldMeta = <Values extends FormikValues, Value = any>(
  getState: GetRefStateFn<Values>
) => (name: string): FieldMetaProps<Value> => {
  const state = getState();

  return selectFieldMetaByName(name)(state);
};
