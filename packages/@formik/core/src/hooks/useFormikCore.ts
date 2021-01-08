import {
  selectIsFormValid,
  selectGetFieldProps,
  selectGetValueFromEvent,
  selectSetErrors,
  selectSetStatus,
  selectSetSubmitting,
  selectGetFieldHelpers,
} from './../selectors';
import {
  GetStateFn,
  FormikValues,
  FormikHelpers,
  FormikState,
  FormikConfig,
  FieldRegistry,
  FormikMessage,
  FormikCoreApi,
  FormikRefs,
  FieldHelpers,
} from '../types';
import { useEventCallback, isFunction } from '../utils';
import {
  selectRunValidateHandler,
  selectRunValidationSchema,
  selectRunSingleFieldLevelValidation,
  selectRunFieldLevelValidations,
  selectRunAllValidations,
  selectValidateForm,
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

export const useFormikCore = <
  Values extends FormikValues,
  State extends FormikState<Values> = FormikState<Values>
>(
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values, State>>,
  props: FormikConfig<Values>,
  refs: FormikRefs<Values>
): FormikCoreApi<Values> => {
  const fieldRegistry = React.useRef<FieldRegistry>({});

  const isFormValid = useEventCallback(selectIsFormValid(props), [props]);

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

  // Run all validations methods and update state accordingly
  const validateForm = useEventCallback(
    selectValidateForm(getState, dispatch, runAllValidations, refs.isMounted),
    [getState, dispatch, runAllValidations, refs.isMounted]
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
    selectSetTouched(getState, dispatch, props.validateOnBlur, validateForm),
    [getState, dispatch, props.validateOnBlur, validateForm]
  );

  const setErrors = React.useCallback(selectSetErrors(dispatch), [dispatch]);

  const setValues = useEventCallback(
    selectSetValues(getState, dispatch, props.validateOnChange, validateForm),
    [dispatch, props.validateOnChange, validateForm]
  );

  const setFieldError = React.useCallback(selectSetFieldError(dispatch), [
    dispatch,
  ]);

  const setFieldValue = useEventCallback(
    selectSetFieldValue(
      getState,
      dispatch,
      props.validateOnChange,
      validateForm
    ),
    [getState, dispatch, props.validateOnChange, validateForm]
  );
  const executeChange = useEventCallback(
    selectExecuteChange(getState, setFieldValue),
    [getState, setFieldValue]
  );

  // We have to help this cast.
  const handleChange = useEventCallback(selectHandleChange(executeChange), [
    executeChange,
  ]) as ReturnType<typeof selectHandleChange>;

  const setFieldTouched = useEventCallback(
    selectSetFieldTouched(
      getState,
      dispatch,
      validateForm,
      props.validateOnBlur
    ),
    [getState, dispatch, validateForm, props.validateOnBlur]
  );

  const executeBlur = React.useCallback(selectExecuteBlur(setFieldTouched), [
    setFieldTouched,
  ]);

  // We have to help this cast.
  const handleBlur = useEventCallback(selectHandleBlur(executeBlur), [
    executeBlur,
  ]) as ReturnType<typeof selectHandleBlur>;

  const setFormikState = React.useCallback(selectSetFormikState(dispatch), [
    getState,
    dispatch,
  ]);

  const setStatus = React.useCallback(selectSetStatus(dispatch), [dispatch]);

  const setSubmitting = React.useCallback(selectSetSubmitting(dispatch), [
    dispatch,
  ]);

  const { onSubmit } = props;

  const executeSubmit = useEventCallback(
    () => onSubmit(getState().values, imperativeMethods),
    [props.onSubmit]
  );

  const submitForm = useEventCallback(
    selectSubmitForm(
      getState,
      dispatch,
      validateForm,
      executeSubmit,
      refs.isMounted
    ),
    [getState, dispatch, validateForm, executeSubmit, refs.isMounted]
  );

  const handleSubmit = useEventCallback(selectHandleSubmit(submitForm), [
    submitForm,
  ]);

  const getFieldMeta = React.useCallback(selectGetFieldMeta(getState, refs), [
    getState,
  ]);

  const getFieldHelpers = React.useCallback(
    selectGetFieldHelpers(setFieldValue, setFieldTouched, setFieldError),
    [setFieldValue, setFieldTouched, setFieldError]
  );

  const getValueFromEvent = React.useCallback(
    selectGetValueFromEvent(getState),
    [getState]
  );

  const getFieldProps = React.useCallback(
    selectGetFieldProps(
      getState,
      handleChange,
      handleBlur,
      setFieldValue,
      getValueFromEvent
    ),
    [getState, handleChange, handleBlur, setFieldValue, getValueFromEvent]
  );

  const imperativeMethods: FormikHelpers<Values> = {
    isFormValid,
    validateForm,
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
    selectResetForm(getState, dispatch, props, refs, imperativeMethods),
    [
      props.initialErrors,
      props.initialStatus,
      props.initialTouched,
      props.onReset,
    ]
  );

  const fieldHelpers: FieldHelpers = {
    getFieldProps,
    getFieldMeta,
    getFieldHelpers,
    getValueFromEvent,
  };

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
    unregisterField,
    registerField,
    ...imperativeMethods,
    ...fieldHelpers,
  };
};
