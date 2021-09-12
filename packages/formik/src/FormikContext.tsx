import * as React from 'react';
import { FormikApi, FormikConnectedType, FormikContextType, FormikSharedConfig, FormikValues, NotOptional } from './types';
import invariant from 'tiny-warning';
import { selectFullState } from './helpers/form-helpers';

/**
 * This Context provides the completely stable Formik API
 *
 * @private
 */
export const FormikContext = React.createContext<FormikContextType<any>>(
  undefined as any
);
FormikContext.displayName = 'FormikContext';

export type FormikProviderProps<Values> = {
  value: FormikContextType<Values> & FormikSharedConfig<Values>;
}

export const FormikProvider = <Values,>(props: React.PropsWithChildren<FormikProviderProps<Values>>) => {
  /**
   * Optimize Renders for ContextProviders.
   *
   * NotOptional allows us to enforce that even
   * possibly undefined properties are passed here.
   */
  const {
    // handlers
    handleBlur,
    handleChange,
    handleReset,
    handleSubmit,
    // helpers
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
    validateForm,
    validateField,
    unregisterField,
    registerField,
    // state helpers
    getState,
    useState,
    // config
    validateOnChange,
    validateOnBlur,
    validateOnMount,
    enableReinitialize,
    validationSchema,
    validate,
    isInitialValid,
  } = props.value;

   const formikApi = React.useMemo<NotOptional<FormikApi<Values>>>(
    () => ({
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
      validateForm,
      validateField,
      unregisterField,
      registerField,
      getState,
      useState,
    }),
    [
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
      validateForm,
      validateField,
      unregisterField,
      registerField,
      getState,
      useState,
    ]
  );

  const formikConfig = React.useMemo<NotOptional<FormikSharedConfig<Values>>>(
    () => ({
      validateOnChange,
      validateOnBlur,
      validateOnMount,
      enableReinitialize,
      validationSchema,
      validate,
      isInitialValid,
    }),
    [
      validateOnChange,
      validateOnBlur,
      validateOnMount,
      enableReinitialize,
      validationSchema,
      validate,
      isInitialValid,
    ]
  );
  return <FormikContext.Provider value={formikApi}>
    <FormikConfigContext.Provider value={formikConfig}>
      {props.children}
    </FormikConfigContext.Provider>
  </FormikContext.Provider>
}

export function useFormikContext<Values extends FormikValues>(): FormikApi<
  Values
> {
  const formikApi = React.useContext(FormikContext);

  invariant(
    !!formikApi,
    `Formik context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  return formikApi;
}

/**
 * This Context provides Formik's configuration, which could change if a developer does not memoize.
 *
 * @private
 */
const FormikConfigContext = React.createContext<FormikSharedConfig<any>>(
  undefined as any
);
FormikConfigContext.displayName = 'FormikConfigContext';

export function useFormikConfig<Values extends FormikValues>(): FormikSharedConfig<
  Values
> {
  const formikConfig = React.useContext(FormikConfigContext);

  invariant(
    !!formikConfig,
    `FormikConfigContext is undefined, please verify you are calling useFormikConfigContext() as child of a <FormikProvider> component.`
  );

  return formikConfig;
}

/**
 * @deprecated Please access state directly via the Formik API.
 */
export function FormikConsumer<Values = any>({
  children,
}: {
  children: (formik: FormikConnectedType<Values>) => React.ReactNode;
}) {
  const formik = useFormikContext<Values>();
  const state = formik.useState(selectFullState);

  invariant(
    !!formik,
    `Formik context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  return (
    <>
      {children({
        ...formik,
        ...state,
      })}
    </>
  );
}
