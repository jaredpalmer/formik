import { FormikValues, GetStateFn, FormikCoreApi, FormikState, FieldMetaProps, ValidateFormFn, FormikValidationConfig, FormikComputedProps } from '@formik/core';

export type FormEffect<Values extends FormikValues> = (state: FormikState<Values>) => void;
export type FieldEffect<Value> = (state: FieldMetaProps<Value>) => void;
export type UnsubscribeFn = () => void;

export type FormikApiContextType<Values extends FormikValues> = 
  FormikCoreApi<Values> & 
  FormikValidationConfig & 
  FormikComputedProps &
  {
    getState: GetStateFn<Values>,
    addFormEffect: (effect: FormEffect<Values>) => UnsubscribeFn,
    addFieldEffect: <Value>(name: string, effect: FieldEffect<Value>) => UnsubscribeFn,
    validateForm: ValidateFormFn<Values>,
  };
