import isEqual from 'react-fast-compare';
import { FormikMessage, formikReducer } from '@formik/core';
import { FormikRefState } from './types';

export function formikRefReducer<Values>(
  state: FormikRefState<Values>,
  msg: FormikMessage<Values, FormikRefState<Values>>
): FormikRefState<Values> {
  state = formikReducer<Values, FormikRefState<Values>>(state, msg);

  /**
   * Add Dirty + InitialX management to the FormikReducer
   */
  switch (msg.type) {
    case 'SET_VALUES':
      return {
        ...state,
        dirty: !isEqual(state.initialValues, state.values),
      };
    case 'RESET_VALUES':
      return {
        ...state,
        initialValues: msg.payload,
        dirty: !isEqual(state.initialValues, state.values),
      };
    case 'RESET_TOUCHED':
      return {
        ...state,
        initialTouched: msg.payload,
      };
    case 'RESET_ERRORS':
      return {
        ...state,
        initialErrors: msg.payload,
      };
    case 'RESET_STATUS':
      return {
        ...state,
        initialStatus: msg.payload,
      };
    case 'SET_FIELD_VALUE':
      return {
        ...state,
        dirty: !isEqual(state.initialValues, state.values),
      };
    default:
      return state;
  }
}
