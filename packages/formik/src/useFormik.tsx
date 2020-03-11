import deepmerge from 'deepmerge';
import isPlainObject from 'lodash/isPlainObject';
import * as React from 'react';
import {
  isPromise,
  setIn,
  getIn,
  useEventCallback,
  useForceRender,
} from './utils';
import { FieldStateAndOperations } from './types';

type $FixMe = any;

/**
 * Values of fields in the form
 */
export interface FormikValues {
  [field: string]: any;
}

/**
 * An object containing error messages whose keys correspond to FormikValues.
 * Should always be an object of strings, but any is allowed to support i18n libraries.
 */
export type FormikErrors<Values> = {
  [K in keyof Values]?: Values[K] extends any[]
    ? Values[K][number] extends object // [number] is the special sauce to get the type of array's element. More here https://github.com/Microsoft/TypeScript/pull/21316
      ? FormikErrors<Values[K][number]>[] | string | string[]
      : string | string[]
    : Values[K] extends object
    ? FormikErrors<Values[K]>
    : string;
};

/**
 * An object containing touched state of the form whose keys correspond to FormikValues.
 */
export type FormikTouched<Values> = {
  [K in keyof Values]?: Values[K] extends any[]
    ? Values[K][number] extends object // [number] is the special sauce to get the type of array's element. More here https://github.com/Microsoft/TypeScript/pull/21316
      ? FormikTouched<Values[K][number]>[]
      : boolean
    : Values[K] extends object
    ? FormikTouched<Values[K]>
    : boolean;
};

type FieldStateOpsAndRefs = FieldStateAndOperations & {
  valueRef: React.MutableRefObject<unknown>;
  touchedRef: React.MutableRefObject<boolean>;
  errorsRef: React.MutableRefObject<string | undefined>;
};
// This is an object that contains a map of all registered fields
// and their validate functions
interface FieldRegistry {
  [field: string]: FieldStateOpsAndRefs;
}
/**
 * Formik state tree
 */
export interface FormikState<Values> {
  /** Form values */
  values: Values;
  /** map of field names to specific error for that field */
  errors: FormikErrors<Values>;
  /** map of field names to whether the field has been touched */
  touched: FormikTouched<Values>;
  /** whether the form is currently submitting */
  isSubmitting: boolean;
  /** Top level status state, in case you need it */
  status?: any;
  /** Number of times user tried to submit the form */
  submitCount: number;
}

interface FormikHelpers<Values> {
  /** Manually set top level status. */
  setStatus(status?: any): void;
  /** Manually set errors object */
  setErrors(errors: FormikErrors<Values>): void;
  /** Manually set isSubmitting */
  setSubmitting(isSubmitting: boolean): void;
  /** Manually set touched object */
  setTouched(touched: FormikTouched<Values>, shouldValidate?: boolean): void;
  /** Manually set values object  */
  setValues(values: Values, shouldValidate?: boolean): void;
  /** Set value of form field directly */
  setFieldValue(field: string, value: any, shouldValidate?: boolean): void;
  /** Set error message of a form field directly */
  setFieldError(field: string, message: string): void;
  /** Set whether field has been touched directly */
  setFieldTouched(
    field: string,
    isTouched?: boolean,
    shouldValidate?: boolean
  ): void;
  /** Validate form values */
  validateForm(values?: any): Promise<FormikErrors<Values>>;
  /** Validate field value */
  validateField(field: string): void;
  /** Reset form */
  resetForm(nextState?: Partial<FormikState<Values>>): void;
  /** Submit the form imperatively */
  submitForm(): Promise<void>;
  /** Set Formik state, careful! */
  setFormikState(
    f:
      | FormikState<Values>
      | ((prevState: FormikState<Values>) => FormikState<Values>),
    cb?: () => void
  ): void;
}

export interface UseFormikOptions<Values> {
  /**
   * Initial values of the form
   */
  initialValues: Values;

  /**
   * Initial status
   */
  initialStatus?: any;

  /** Initial object map of field names to specific error for that field */
  initialErrors?: FormikErrors<Values>;

  /** Initial object map of field names to whether the field has been touched */
  initialTouched?: FormikTouched<Values>;

  /**
   * Submission handler
   */
  onSubmit: (
    values: Values,
    formikHelpers: FormikHelpers<Values>
  ) => void | Promise<any>;
  /**
   * A Yup Schema or a function that returns a Yup schema
   */
  validationSchema?: any | (() => any);

  /**
   * Validation function. Must return an error object or promise that
   * throws an error object where that object keys map to corresponding value.
   */
  validate?: (values: Values) => void | object | FormikErrors<Values>;
}

// Helper to map through field registry
const forEachField = (
  ref: React.MutableRefObject<FieldRegistry>,
  cb: (key: string, field: FieldStateOpsAndRefs) => void
) => {
  Object.keys(ref.current).forEach(key => {
    cb(key, ref.current[key]);
  });
};

export function useFormik<Values extends FormikValues = FormikValues>({
  // validateOnChange = true, // @todo
  // validateOnBlur = true, // @todo
  // validateOnMount = false, // @todo
  // isInitialValid, // @todo
  // enableReinitialize = false, // @todo
  onSubmit,
  validate,
  initialValues,
  validationSchema,
}: UseFormikOptions<Values>) {
  const fieldRegistry = React.useRef<FieldRegistry>({});
  const forceUpdate = useForceRender();
  const [isSubmitting, setSubmitting] = React.useState(false);

  const register = useEventCallback((name, stuff) => {
    fieldRegistry.current[name] = stuff;
  });

  const unregister = useEventCallback(name => {
    delete fieldRegistry.current[name];
  });

  const setValues = useEventCallback(values => {
    forEachField(fieldRegistry, (key, field) => {
      field.setValue(getIn(values, key));
    });
  });

  const setErrors = useEventCallback(errors => {
    forEachField(fieldRegistry, (key, field) => {
      field.setError(getIn(errors, key));
    });
  });

  const setTouched = useEventCallback(touched => {
    forEachField(fieldRegistry, (key, field) => {
      field.setTouched(getIn(touched, key));
    });
  });

  const setFieldValue = useEventCallback(
    (key: string, value?: $FixMe, _shouldValidate?: boolean) => {
      fieldRegistry.current[key]?.setValue(value);
    }
  );

  const setFieldTouched = useEventCallback(
    (key: string, touched: boolean = true, _shouldValidate?: boolean) => {
      fieldRegistry.current[key]?.setTouched(touched);
    }
  );

  const setFieldError = useEventCallback((key: string, error?: string) => {
    fieldRegistry.current[key]?.setError(error);
  });

  const getValues = useEventCallback(() => {
    return Object.keys(fieldRegistry.current).reduce((prev, curr) => {
      (prev as Record<string, unknown>)[curr] =
        fieldRegistry.current[curr].valueRef.current;
      return prev;
    }, {} as Values);
  });

  const getTouched = useEventCallback(() => {
    return Object.keys(fieldRegistry.current).reduce((prev, curr) => {
      (prev as Record<string, unknown>)[curr] =
        fieldRegistry.current[curr].touchedRef.current;
      return prev;
    }, {} as FormikTouched<Values>);
  });

  const getErrors = useEventCallback(() => {
    return Object.keys(fieldRegistry.current).reduce((prev, curr) => {
      if (
        fieldRegistry.current[curr].errorsRef &&
        fieldRegistry.current[curr].errorsRef.current
      ) {
        (prev as Record<string, unknown>)[curr] =
          fieldRegistry.current[curr].errorsRef.current;
      }
      return prev;
    }, {} as FormikErrors<Values>);
  });

  const validateForm = useEventCallback(() => {
    throw new Error('not implemented');
  });

  const validateField = useEventCallback(() => {
    throw new Error('not implemented');
  });

  const setStatus = useEventCallback(() => {
    throw new Error('not implemented');
  });

  const submitForm = useEventCallback(() => {
    throw new Error('not implemented');
  });

  const resetForm = useEventCallback(() => {
    throw new Error('not implemented');
  });

  // @todo we may need ResetButton or useResetButton()
  const handleReset = useEventCallback(() => {
    throw new Error('not implemented');
  });

  const setFormikState = useEventCallback(() => {
    throw new Error('not implemented');
  });

  // @todo
  // const handleFocus = useEventCallback(() => {
  //   throw new Error('not implemented');
  // });
  // const setFocus = useEventCallback(() => {
  //   throw new Error('not implemented');
  // });

  // @todo fake these?
  // const getFieldProps = useEventCallback(() => {
  //   throw new Error('not implemented');
  // });
  // const getFieldMeta = useEventCallback(() => {
  //   throw new Error('not implemented');
  // });
  // const getFieldHelpers = useEventCallback(() => {
  //   throw new Error('not implemented');
  // });

  const handleSubmit = useEventCallback(async e => {
    if (e.preventDefault) {
      e.preventDefault();
    }

    // set submitting to true
    setSubmitting(true);

    let fieldErrors: any = {};
    let formValidateErrors;
    let formSchemaErrors;

    // validate fields
    forEachField(fieldRegistry, (key, field) => {
      field.setTouched(true);
      if (field.validate) {
        fieldErrors[key] = field.validate(field.valueRef.current);
      }
    });

    // @todo extract and implement validateForm and validateField
    if (validate) {
      formValidateErrors = validate(getValues());
    }

    if (validationSchema) {
      try {
        validateYupSchema(getValues(), validationSchema, true);
      } catch (err) {
        // Yup will throw a validation error if validation fails. We catch those and
        // resolve them into Formik errors. We can sniff if something is a Yup error
        // by checking error.name.
        // @see https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string
        if (err.name === 'ValidationError') {
          formSchemaErrors = yupToFormErrors(err);
        } else {
          // We throw any other errors
          if (process.env.NODE_ENV !== 'production') {
            console.warn(
              `Warning: An unhandled error was caught during validation in <Formik validationSchema />`,
              err
            );
          }
        }
      }
    }

    const combinedErrors = deepmerge.all<FormikErrors<Values>>(
      [fieldErrors, formSchemaErrors, formValidateErrors],
      { arrayMerge }
    );

    setErrors(combinedErrors);
    forceUpdate();

    if (Object.keys(getErrors()).length === 0) {
      const maybePromise = onSubmit(getValues(), {
        setSubmitting,
        setStatus,
        setTouched,
        setValues,
        setErrors,
        setFieldTouched,
        setFieldValue,
        setFieldError,
        // setFocus,
        validateField,
        validateForm,
        resetForm,
        submitForm,
        setFormikState,
      });
      if (isPromise(maybePromise)) {
        maybePromise.then(() => {
          setSubmitting(false);
          forceUpdate();
        });
      } else {
        forceUpdate();
      }
    } else {
      setSubmitting(false);
      forceUpdate();
    }
  });

  const ctx = React.useMemo(() => {
    const bag = {
      register,
      unregister,
      forceUpdate,
      getValues,
      getTouched,
      getErrors,
      handleSubmit,
      setSubmitting,
      setTouched,
      setValues,
      setErrors,
      setFieldTouched,
      setFieldValue,
      setFieldError,
      initialValues,
      isSubmitting,
      validateField,
      validateForm,
      resetForm,
      submitForm,
      setFormikState,
    };
    return bag;
  }, [
    register,
    unregister,
    forceUpdate,
    getValues,
    getTouched,
    getErrors,
    handleSubmit,
    setTouched,
    setValues,
    setErrors,
    setFieldTouched,
    setFieldValue,
    setFieldError,
    initialValues,
    isSubmitting,
    validateField,
    validateForm,
    resetForm,
    submitForm,
    setFormikState,
  ]);
  return ctx;
}

function yupToFormErrors<Values>(yupError: any): FormikErrors<Values> {
  let errors: FormikErrors<Values> = {};
  if (yupError.inner) {
    if (yupError.inner.length === 0) {
      return setIn(errors, yupError.path, yupError.message);
    }
    for (let err of yupError.inner) {
      if (!getIn(errors, err.path)) {
        errors = setIn(errors, err.path, err.message);
      }
    }
  }
  return errors;
}

/**
 * Validate a yup schema.
 */
export function validateYupSchema<T extends FormikValues>(
  values: T,
  schema: any,
  sync: boolean = false,
  context: any = {}
): Promise<Partial<T>> {
  const validateData: FormikValues = prepareDataForValidation(values);
  return schema[sync ? 'validateSync' : 'validate'](validateData, {
    abortEarly: false,
    context: context,
  });
}

/**
 * Recursively prepare values.
 */
function prepareDataForValidation<T extends FormikValues>(
  values: T
): FormikValues {
  let data: FormikValues = Array.isArray(values) ? [] : {};
  for (let k in values) {
    if (Object.prototype.hasOwnProperty.call(values, k)) {
      const key = String(k);
      if (Array.isArray(values[key]) === true) {
        data[key] = values[key].map((value: any) => {
          if (Array.isArray(value) === true || isPlainObject(value)) {
            return prepareDataForValidation(value);
          } else {
            return value !== '' ? value : undefined;
          }
        });
      } else if (isPlainObject(values[key])) {
        data[key] = prepareDataForValidation(values[key]);
      } else {
        data[key] = values[key] !== '' ? values[key] : undefined;
      }
    }
  }
  return data;
}

/**
 * deepmerge array merging algorithm
 * https://github.com/KyleAMathews/deepmerge#combine-array
 */
function arrayMerge(target: any[], source: any[], options: any): any[] {
  const destination = target.slice();

  source.forEach(function(e: any, i: number) {
    if (typeof destination[i] === 'undefined') {
      const cloneRequested = options.clone !== false;
      const shouldClone = cloneRequested && options.isMergeableObject(e);
      destination[i] = shouldClone
        ? deepmerge(Array.isArray(e) ? [] : {}, e, options)
        : e;
    } else if (options.isMergeableObject(e)) {
      destination[i] = deepmerge(target[i], e, options);
    } else if (target.indexOf(e) === -1) {
      destination.push(e);
    }
  });
  return destination;
}
