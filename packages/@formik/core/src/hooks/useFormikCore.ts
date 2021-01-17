import { useCheckableEventCallback } from './../utils';
import {
  selectIsFormValid,
  selectGetFieldProps,
  selectGetValueFromEvent,
  selectSetErrors,
  selectSetStatus,
  selectSetSubmitting,
  selectGetFieldHelpers,
  SetFieldTouchedFn,
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

  const isFormValid = useCheckableEventCallback(
    () => selectIsFormValid(props),
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

  const executeSubmit = useCheckableEventCallback(
    () => () => onSubmit(getState().values, imperativeMethods),
    [getState, imperativeMethods, onSubmit]
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
    [getState, dispatch, validateForm, executeSubmit, refs.isMounted]
  );

  const handleSubmit = useCheckableEventCallback(
    () => selectHandleSubmit(submitForm),
    [submitForm]
  );

  const getFieldMeta = React.useCallback(selectGetFieldMeta(getState, refs), [
    getState,
  ]);

  const getFieldHelpers = React.useCallback(
    selectGetFieldHelpers(setFieldValue, setFieldTouched, setFieldError),
    [setFieldValue, setFieldTouched, setFieldError]
  );

  const getValueFromEvent = React.useCallback(
    selectGetValueFromEvent(getState),
    []
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

  const resetForm = useCheckableEventCallback(
    () => selectResetForm(getState, dispatch, props, refs, imperativeMethods),
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
