import { isFunction, useCheckableEventCallback } from './../utils';
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
} from '../types';
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
import React, { useMemo } from 'react';

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

  const isFormValid = useCheckableEventCallback(
    () => selectIsFormValid(props),
    [props]
  );

  const runValidateHandler = useCheckableEventCallback(
    () => selectRunValidateHandler(props.validate),
    [props.validate]
  );

  /**
   * Run validation against a Yup schema and optionally run a function if successful
   */
  const runValidationSchema = useCheckableEventCallback(
    () => selectRunValidationSchema<Values>(props.validationSchema),
    [props.validationSchema]
  );

  const runSingleFieldLevelValidation = useCheckableEventCallback(
    () => selectRunSingleFieldLevelValidation(fieldRegistry),
    [fieldRegistry]
  );

  const runFieldLevelValidations = useCheckableEventCallback(
    () =>
      selectRunFieldLevelValidations<Values>(
        runSingleFieldLevelValidation,
        fieldRegistry
      ),
    [runSingleFieldLevelValidation, fieldRegistry]
  );

  // Run all validations and return the result
  const runAllValidations = useCheckableEventCallback(
    () =>
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
  const validateForm = useCheckableEventCallback(
    () =>
      selectValidateForm(getState, dispatch, runAllValidations, refs.isMounted),
    [getState, dispatch, runAllValidations, refs.isMounted]
  );

  const validateField = useCheckableEventCallback(
    () =>
      selectValidateField(
        fieldRegistry,
        getState,
        dispatch,
        props.validationSchema,
        runValidationSchema
      ),
    [dispatch, getState, props.validationSchema, runValidationSchema]
  );

  const setTouched = useCheckableEventCallback(
    () =>
      selectSetTouched(getState, dispatch, props.validateOnBlur, validateForm),
    [getState, dispatch, props.validateOnBlur, validateForm]
  );

  const setErrors = useCheckableEventCallback(() => selectSetErrors(dispatch), [
    dispatch,
  ]);

  const setValues = useCheckableEventCallback(
    () =>
      selectSetValues(getState, dispatch, props.validateOnChange, validateForm),
    [dispatch, getState, props.validateOnChange, validateForm]
  );

  const setFieldError = useCheckableEventCallback(
    () => selectSetFieldError(dispatch),
    [dispatch]
  );

  const setFieldValue = useCheckableEventCallback(
    () =>
      selectSetFieldValue(
        getState,
        dispatch,
        props.validateOnChange,
        validateForm
      ),
    [getState, dispatch, props.validateOnChange, validateForm]
  );
  const executeChange = useCheckableEventCallback(
    () => selectExecuteChange(getState, setFieldValue),
    [getState, setFieldValue]
  );

  // We have to help this cast.
  const handleChange = useCheckableEventCallback(
    () => selectHandleChange(executeChange),
    [executeChange]
  ) as ReturnType<typeof selectHandleChange>;

  const setFieldTouched = useCheckableEventCallback(
    () =>
      selectSetFieldTouched(
        getState,
        dispatch,
        validateForm,
        props.validateOnBlur
      ),
    [getState, dispatch, validateForm, props.validateOnBlur]
  );

  const executeBlur = useCheckableEventCallback(
    () => selectExecuteBlur(setFieldTouched),
    [setFieldTouched]
  );

  // We have to help this cast.
  const handleBlur = useCheckableEventCallback(
    () => selectHandleBlur(executeBlur),
    [executeBlur]
  ) as ReturnType<typeof selectHandleBlur>;

  const setFormikState = React.useMemo(() => selectSetFormikState(dispatch), [
    dispatch,
  ]);

  const setStatus = useCheckableEventCallback(() => selectSetStatus(dispatch), [
    dispatch,
  ]);

  const setSubmitting = useCheckableEventCallback(
    () => selectSetSubmitting(dispatch),
    [dispatch]
  );

  const { onSubmit } = props;

  const executeSubmit = useCheckableEventCallback(() => () =>
    onSubmit(getState().values, imperativeMethods)
  );

  const submitForm = useCheckableEventCallback(
    () =>
      selectSubmitForm(
        getState,
        dispatch,
        validateForm,
        executeSubmit,
        refs.isMounted
      ),
    [dispatch, executeSubmit, getState, refs.isMounted, validateForm]
  );

  const resetForm = useCheckableEventCallback(() =>
    selectResetForm(getState, dispatch, props, refs, imperativeMethods)
  );

  // This is a bag of stable, imperative methods.
  // These should all be constant functions or the result of useCheckableEventCallback.
  const imperativeMethods: FormikHelpers<Values> = useMemo(
    () => ({
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
      resetForm,
    }),
    [
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
      resetForm,
    ]
  );

  const handleSubmit = useCheckableEventCallback(
    () => selectHandleSubmit(submitForm),
    [submitForm]
  );

  const handleReset = useCheckableEventCallback(
    () => e => {
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

  /**
   * Field Helpers
   */
  const getFieldMeta = useCheckableEventCallback(
    () => selectGetFieldMeta(getState, refs),
    [getState, refs]
  );

  const getFieldHelpers = useCheckableEventCallback(
    () => selectGetFieldHelpers(setFieldValue, setFieldTouched, setFieldError),
    [setFieldValue, setFieldTouched, setFieldError]
  );

  const getValueFromEvent = useCheckableEventCallback(
    () => selectGetValueFromEvent(getState),
    [getState]
  );

  const getFieldProps = useCheckableEventCallback(
    () =>
      selectGetFieldProps(
        getState,
        handleChange,
        handleBlur,
        setFieldValue,
        getValueFromEvent
      ),
    [getState, handleChange, handleBlur, setFieldValue, getValueFromEvent]
  );

  return useMemo(
    () => ({
      handleBlur,
      handleChange,
      handleReset,
      handleSubmit,
      unregisterField,
      registerField,
      ...imperativeMethods,
      getFieldMeta,
      getFieldHelpers,
      getFieldProps,
      getValueFromEvent,
    }),
    [
      getFieldHelpers,
      getFieldMeta,
      getFieldProps,
      getValueFromEvent,
      handleBlur,
      handleChange,
      handleReset,
      handleSubmit,
      imperativeMethods,
      registerField,
      unregisterField,
    ]
  );
};
