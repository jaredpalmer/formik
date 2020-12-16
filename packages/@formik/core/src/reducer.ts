import { FormikState, FormikMessage, FormikTouched } from './types';
import { isEqual } from 'lodash';
import { setIn, setNestedObjectValues } from './utils';

export function formikReducer<Values>(
  state: FormikState<Values>,
  msg: FormikMessage<Values>
) {
  switch (msg.type) {
    case 'SET_VALUES':
      return {
        ...state,
        values: msg.payload,
        dirty: !isEqual(state.initialValues, msg.payload),
      };
    case 'RESET_VALUES':
      return { ...state, initialValues: msg.payload, dirty: false };
    case 'SET_TOUCHED':
      return { ...state, touched: msg.payload };
    case 'RESET_TOUCHED':
      return {
        ...state,
        initialTouched: msg.payload,
        touched: msg.payload,
      };
    case 'SET_ERRORS':
      if (isEqual(state.errors, msg.payload)) {
        return state;
      }

      return { ...state, errors: msg.payload };
    case 'RESET_ERRORS':
      return {
        ...state,
        initialErrors: msg.payload,
        errors: msg.payload,
      };
    case 'SET_STATUS':
      return { ...state, status: msg.payload };
    case 'RESET_STATUS':
      return {
        ...state,
        initialStatus: msg.payload,
        status: msg.payload,
      };
    case 'SET_ISSUBMITTING':
      return { ...state, isSubmitting: msg.payload };
    case 'SET_ISVALIDATING':
      return { ...state, isValidating: msg.payload };
    case 'SET_FIELD_VALUE':
      const newValues = setIn(
        state.values,
        msg.payload.field,
        msg.payload.value
      );
      return {
        ...state,
        values: newValues,
        dirty: !isEqual(state.initialValues, newValues),
      };
    case 'SET_FIELD_TOUCHED':
      return {
        ...state,
        touched: setIn(state.touched, msg.payload.field, msg.payload.value),
      };
    case 'SET_FIELD_ERROR':
      return {
        ...state,
        errors: setIn(state.errors, msg.payload.field, msg.payload.value),
      };
    case 'RESET_FORM':
      return { ...state, ...msg.payload };
    case 'SET_FORMIK_STATE':
      return msg.payload;
    case 'SUBMIT_ATTEMPT':
      return {
        ...state,
        touched: setNestedObjectValues<FormikTouched<Values>>(
          state.values,
          true
        ),
        isSubmitting: true,
        submitCount: state.submitCount + 1,
      };
    case 'SUBMIT_FAILURE':
      return {
        ...state,
        isSubmitting: false,
      };
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        isSubmitting: false,
      };
    default:
      return state;
  }
}
