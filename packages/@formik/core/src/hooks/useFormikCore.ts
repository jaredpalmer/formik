import { selectIsFormValid } from './../selectors';
import {
  GetStateFn,
  FormikValues,
  FormikErrors,
  FormikHelpers,
  FormikState,
  FormikConfig,
  FieldRegistry,
  FormikMessage,
  FieldHelperProps,
  FieldInputProps,
  FormikCoreApi,
} from '../types';
import { useEventCallback, isFunction, isObject, getIn } from '../utils';
import {
  selectRunValidateHandler,
  selectRunValidationSchema,
  selectRunSingleFieldLevelValidation,
  selectRunFieldLevelValidations,
  selectRunAllValidations,
  selectValidateFormWithLowPriorities,
  selectValidateFormWithHighPriority,
  selectValidateField,
  selectSetTouched,
  selectSetValues,
  selectSetFieldError,
  selectSetFieldValue,
  selectSetFieldTouched,
  selectSetFormikState,
  selectSubmitForm,
  selectResetForm,
  selectExecuteBlur,
  selectHandleSubmit,
  selectExecuteChange,
  selectHandleChange,
  selectHandleBlur,
  selectGetFieldMeta,
} from '../selectors';
import React from 'react';

export const useFormikCore = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>,
  props: FormikConfig<Values>,
  isMounted: React.MutableRefObject<boolean>
): FormikCoreApi<Values> => {
  const fieldRegistry = React.useRef<FieldRegistry>({});

  const isFormValid = useEventCallback(
    selectIsFormValid(props),
    [props]
  );

  const registerField = React.useCallback(
    (name: string, { validate }: any) => {
      fieldRegistry.current[name] = {
        validate,
      };
    },
    [fieldRegistry]
  );

  const unregisterField = React.useCallback(
    (name: string) => {
      delete fieldRegistry.current[name];
    },
    [fieldRegistry]
  );

  const runValidateHandler = useEventCallback(
    selectRunValidateHandler(props.validate),
    [props.validate]
  );

  /**
   * Run validation against a Yup schema and optionally run a function if successful
   */
  const runValidationSchema = useEventCallback(
    selectRunValidationSchema<Values>(props.validationSchema),
    [props.validationSchema]
  );

  const runSingleFieldLevelValidation = React.useCallback(
    selectRunSingleFieldLevelValidation(fieldRegistry),
    [fieldRegistry]
  );

  const runFieldLevelValidations = useEventCallback(
    selectRunFieldLevelValidations<Values>(
      runSingleFieldLevelValidation,
      fieldRegistry
    ),
    [runSingleFieldLevelValidation, fieldRegistry]
  );

  // Run all validations and return the result
  const runAllValidations = useEventCallback(
    selectRunAllValidations(
      props.validate,
      props.validationSchema,
      runFieldLevelValidations,
      runValidationSchema,
      runValidateHandler
    ),
    [
      props.validate,
      props.validationSchema,
      runFieldLevelValidations,
      runValidationSchema,
      runValidateHandler,
    ]
  );

  // Run validations and dispatching the result as low-priority via rAF.
  //
  // The thinking is that validation as a result of onChange and onBlur
  // should never block user input. Note: This method should never be called
  // during the submission phase because validation prior to submission
  // is actaully high-priority since we absolutely need to guarantee the
  // form is valid before executing props.onSubmit.
  const validateFormWithLowPriority = useEventCallback(
    selectValidateFormWithLowPriorities(
      getState,
      dispatch,
      runAllValidations,
      isMounted
    ),
    [getState, dispatch, runAllValidations, isMounted]
  );

  // Run all validations methods and update state accordingly
  const validateFormWithHighPriority = useEventCallback(
    selectValidateFormWithHighPriority(
      getState,
      dispatch,
      runAllValidations,
      isMounted
    ),
    [getState, dispatch, runAllValidations, isMounted]
  );

  const validateField = useEventCallback(
    selectValidateField(
      fieldRegistry,
      getState,
      dispatch,
      props.validationSchema,
      runValidationSchema
    ),
    [fieldRegistry, getState, props.validationSchema, runValidationSchema]
  );

  const setTouched = useEventCallback(
    selectSetTouched(
      getState,
      dispatch,
      props.validateOnBlur,
      validateFormWithLowPriority
    ),
    [getState, dispatch, props.validateOnBlur, validateFormWithLowPriority]
  );

  const setErrors = React.useCallback((errors: FormikErrors<Values>) => {
    dispatch({ type: 'SET_ERRORS', payload: errors });
  }, []);

  const setValues = useEventCallback(
    selectSetValues(
      dispatch,
      props.validateOnChange,
      validateFormWithLowPriority
    ),
    [dispatch, props.validateOnChange, validateFormWithLowPriority]
  );

  const setFieldError = React.useCallback(selectSetFieldError(dispatch), [
    dispatch,
  ]);

  const setFieldValue = useEventCallback(
    selectSetFieldValue(
      getState,
      dispatch,
      props.validateOnChange,
      validateFormWithLowPriority
    ),
    [getState, dispatch, props.validateOnChange, validateFormWithLowPriority]
  );
  const executeChange = useEventCallback(
    selectExecuteChange(getState, setFieldValue),
    [getState, setFieldValue]
  );
  const handleChange = useEventCallback(selectHandleChange(executeChange), [
    executeChange,
  ]);
  const setFieldTouched = useEventCallback(
    selectSetFieldTouched(
      getState,
      dispatch,
      validateFormWithLowPriority,
      props.validateOnBlur
    ),
    [getState, dispatch, validateFormWithLowPriority, props.validateOnBlur]
  );

  const executeBlur = React.useCallback(selectExecuteBlur(setFieldTouched), [
    setFieldTouched,
  ]);

  const handleBlur = useEventCallback(selectHandleBlur(executeBlur), [
    executeBlur,
  ]);

  const setFormikState = React.useCallback(
    selectSetFormikState(getState, dispatch),
    [getState, dispatch]
  );

  const setStatus = React.useCallback(
    (status: any) => {
      dispatch({ type: 'SET_STATUS', payload: status });
    },
    [dispatch]
  );

  const setSubmitting = React.useCallback(
    (isSubmitting: boolean) => {
      dispatch({ type: 'SET_ISSUBMITTING', payload: isSubmitting });
    },
    [dispatch]
  );

  const executeSubmit = useEventCallback(
    () => props.onSubmit(getState().values, imperativeMethods),
    [props.onSubmit]
  );

  const submitForm = useEventCallback(
    selectSubmitForm(
      getState,
      dispatch,
      validateFormWithHighPriority,
      executeSubmit,
      isMounted
    ),
    [getState, dispatch, validateFormWithHighPriority, executeSubmit, isMounted]
  );

  const handleSubmit = useEventCallback(selectHandleSubmit(submitForm), [
    submitForm,
  ]);

  /**
   * These getters are not related to a render.
   *
   * They use refs!
   */
  const getFieldMeta = React.useCallback(
    selectGetFieldMeta(getState),
    [getState]
  );

  const getFieldHelpers = React.useCallback(
    (name: string): FieldHelperProps<any> => {
      return {
        setValue: (value: any, shouldValidate?: boolean) =>
          setFieldValue(name, value, shouldValidate),
        setTouched: (value: boolean, shouldValidate?: boolean) =>
          setFieldTouched(name, value, shouldValidate),
        setError: (value: any) => setFieldError(name, value),
      };
    },
    [setFieldValue, setFieldTouched, setFieldError]
  );

  const getFieldProps = React.useCallback(
    (nameOrOptions: any): FieldInputProps<any> => {
      const state = getState();
      const isAnObject = isObject(nameOrOptions);
      const name = isAnObject ? nameOrOptions.name : nameOrOptions;
      const valueState = getIn(state.values, name);

      const field: FieldInputProps<any> = {
        name,
        value: valueState,
        onChange: handleChange,
        onBlur: handleBlur,
      };
      if (isAnObject) {
        const {
          type,
          value: valueProp, // value is special for checkboxes
          as: is,
          multiple,
        } = nameOrOptions;

        if (type === 'checkbox') {
          if (valueProp === undefined) {
            field.checked = !!valueState;
          } else {
            field.checked = !!(
              Array.isArray(valueState) && ~valueState.indexOf(valueProp)
            );
            field.value = valueProp;
          }
        } else if (type === 'radio') {
          field.checked = valueState === valueProp;
          field.value = valueProp;
        } else if (is === 'select' && multiple) {
          field.value = field.value || [];
          field.multiple = true;
        }
      }
      return field;
    },
    [handleBlur, handleChange]
  );

  const imperativeMethods: FormikHelpers<Values> = {
    isFormValid,
    validateForm: validateFormWithHighPriority,
    validateField,
    setErrors,
    setFieldError,
    setFieldTouched,
    setFieldValue,
    setStatus,
    setSubmitting,
    setTouched,
    setValues,
    setFormikState,
    submitForm,
    resetForm: (nextState?: Partial<FormikState<Values>> | undefined) =>
      resetForm(nextState),
  };

  const resetForm = useEventCallback(
    selectResetForm(
      getState,
      dispatch,
      props.initialErrors,
      props.initialTouched,
      props.initialStatus,
      props.onReset,
      imperativeMethods
    ),
    [
      props.initialErrors,
      props.initialStatus,
      props.initialTouched,
      props.onReset,
    ]
  );

  const handleReset = useEventCallback(
    e => {
      if (e && e.preventDefault && isFunction(e.preventDefault)) {
        e.preventDefault();
      }

      if (e && e.stopPropagation && isFunction(e.stopPropagation)) {
        e.stopPropagation();
      }

      resetForm();
    },
    [resetForm]
  );

  return {
    handleBlur,
    handleChange,
    handleReset,
    handleSubmit,
    resetForm,
    setErrors,
    setFormikState,
    setFieldTouched,
    setFieldValue,
    setFieldError,
    setStatus,
    setSubmitting,
    setTouched,
    setValues,
    submitForm,
    isFormValid,
    validateFormWithLowPriority,
    validateFormWithHighPriority,
    validateField,
    unregisterField,
    registerField,
    getFieldProps,
    getFieldMeta,
    getFieldHelpers,
  };
};
