import {
  FormikErrors,
  FormikState,
  FormikValues,
  FormikTouched,
  setIn,
} from '.';

/**
 * We probably should not use a constant enum here, but Babel 7 isn't out yet
 */
export enum FormikConstants {
  SUBMIT_FORM = 'SUBMIT_FORM',
  VALIDATE_ATTEMPT = 'VALIDATE_ATTEMPT',
  VALIDATE_FAILURE = 'VALIDATE_FAILURE',
  VALIDATE_SUCCESS = 'VALIDATE_SUCCESS',
  RESET_FORM = 'RESET_FORM',
  SET_FORMIK_STATE = 'SET_FORMIK_STATE',
  SET_FIELD_VALUE = 'SET_FIELD_VALUE',
  SET_FIELD_ERROR = 'SET_FIELD_ERROR',
  SET_FIELD_TOUCHED = 'SET_FIELD_TOUCHED',
  SET_VALUES = 'SET_VALUES',
  SET_TOUCHED = 'SET_TOUCHED',
  SET_ERRORS = 'SET_ERRORS',
  SET_STATUS = 'SET_STATUS',
  SET_SUBMITTING = 'SET_SUBMITTING',
}

export type Actions<Values> =
  | {
      type: FormikConstants.SUBMIT_FORM;
    }
  | {
      type: FormikConstants.VALIDATE_ATTEMPT;
    }
  | {
      type: FormikConstants.VALIDATE_SUCCESS;
    }
  | {
      type: FormikConstants.VALIDATE_FAILURE;
      payload: FormikErrors<Values>;
    }
  | {
      type: FormikConstants.RESET_FORM;
      payload?: FormikValues;
    }
  | {
      type: FormikConstants.SET_FORMIK_STATE;
      payload: FormikState<Values>;
    }
  | {
      type: FormikConstants.SET_SUBMITTING;
      payload: boolean;
    }
  | {
      type: FormikConstants.SET_FIELD_VALUE;
      payload: { field: string; value: any };
    }
  | {
      type: FormikConstants.SET_FIELD_ERROR;
      payload: { field: string; value?: string };
    }
  | {
      type: FormikConstants.SET_FIELD_TOUCHED;
      payload: { field: string; value: boolean };
    }
  | {
      type: FormikConstants.SET_VALUES;
      payload: FormikValues;
    }
  | {
      type: FormikConstants.SET_TOUCHED;
      payload: FormikTouched<Values>;
    }
  | {
      type: FormikConstants.SET_STATUS;
      payload?: any;
    }
  | {
      type: FormikConstants.SET_ERRORS;
      payload: FormikErrors<Values>;
    };

export function reducer<Values>(
  state: FormikState<Values>,
  action: Actions<Values>
) {
  switch (action.type) {
    case FormikConstants.VALIDATE_ATTEMPT:
      return {
        ...state,
        isValidating: true,
      };
    case FormikConstants.VALIDATE_FAILURE:
      return {
        ...state,
        isValidating: false,
        errors: action.payload,
      };
    case FormikConstants.VALIDATE_SUCCESS:
      return {
        ...state,
        isValidating: false,
        errors: {},
      };
    case FormikConstants.SET_VALUES:
      return { ...state, values: action.payload };
    case FormikConstants.SET_ERRORS:
      return { ...state, errors: action.payload };
    case FormikConstants.SET_TOUCHED:
      return { ...state, touched: action.payload };
    case FormikConstants.SET_STATUS:
      return { ...state, status: action.payload };
    case FormikConstants.SET_SUBMITTING:
      return { ...state, isSubmitting: action.payload };
    case FormikConstants.SET_FORMIK_STATE:
      return action.payload;
    case FormikConstants.SET_FIELD_VALUE:
      return {
        ...state,
        values: setIn(state.values, action.payload.field, action.payload.value),
      };
    case FormikConstants.SET_FIELD_ERROR:
      return {
        ...state,
        values: setIn(state.errors, action.payload.field, action.payload.value),
      };
    case FormikConstants.SET_FIELD_TOUCHED:
      return {
        ...state,
        values: setIn(
          state.touched,
          action.payload.field,
          action.payload.value
        ),
      };
    default:
      return state;
  }
}
