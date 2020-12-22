import {
    AnyDispatch,
    FormikConfig,
    FormikHelpers,
    FormikState,
    FormikValues,
    isPromise
} from "@formik/core";
import { GetRefStateFn } from "./types";

export const selectRefResetForm = <Values extends FormikValues>(
  getState: GetRefStateFn<Values>,
  dispatch: AnyDispatch<Values>,
  initialErrors: FormikConfig<Values>['initialErrors'],
  initialTouched: FormikConfig<Values>['initialTouched'],
  initialStatus: FormikConfig<Values>['initialStatus'],
  onReset: FormikConfig<Values>['onReset'],
  imperativeMethods: FormikHelpers<Values>
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