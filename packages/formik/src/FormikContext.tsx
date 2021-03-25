import * as React from 'react';
import { FormikApi, FormikContextType, FormikSharedConfig, FormikValues } from './types';
import invariant from 'tiny-warning';
import { FormikConnectedType } from './connect';
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
  value: FormikContextType<Values>;
  config: FormikSharedConfig<Values>;
}

export const FormikProvider = <Values,>(props: React.PropsWithChildren<FormikProviderProps<Values>>) => {
  return <FormikContext.Provider value={props.value}>
    <FormikConfigContext.Provider value={props.config}>
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
