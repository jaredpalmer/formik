import { isFunction, isPromise } from './utils';

/**
 * An object containing error messages whose keys correspond to FormikValues.
 */
export type FormikErrors = {
  [field: string]: string;
};

/**
 * Transform Yup ValidationError to a more usable object
 */
export function yupToFormErrors(yupError: any): FormikErrors {
  let errors: FormikErrors = {};
  for (let err of yupError.inner) {
    if (!errors[err.path]) {
      errors[err.path] = err.message;
    }
  }
  return errors;
}

export function createValidator(validate?: Function, validationSchema?: any) {
  if (validate) {
    return createFunctionValidator(validate);
  } else if (validationSchema) {
    const schema = isFunction(validationSchema)
      ? validationSchema()
      : validationSchema;
    if (schema) {
      return createYupValidator(schema);
    } else {
      return createDumbValidator();
    }
  } else {
    return createDumbValidator();
  }
}

const SyncPromise = {
  resolve: (resolve?: Function) => ({
    then: (success: Function) => success(resolve),
  }),
  reject: (reject?: Function) => ({
    then: (_success: Function, error: Function) => error(reject),
  }),
};

export function createFunctionValidator(validate: Function) {
  return (values: any) => {
    const maybePromisedErrors = (validate as any)(values) || {};
    if (isPromise(maybePromisedErrors)) {
      return maybePromisedErrors;
    } else {
      const isValid = Object.keys(maybePromisedErrors).length === 0;

      if (isValid) {
        return SyncPromise.resolve();
      } else {
        return SyncPromise.reject(maybePromisedErrors);
      }
    }
  };
}

export function createYupValidator(schema: any) {
  return (values: any) => {
    return new Promise((resolve, reject) => {
      validateYupSchema(values, schema).then(
        () => resolve(),
        (err: any) => reject(yupToFormErrors(err))
      );
    });
  };
}

export function createDumbValidator() {
  return () => SyncPromise.resolve();
}

/**
 * Validate a yup schema.
 */
export function validateYupSchema<T>(data: T, schema: any): Promise<void> {
  let validateData: any = {};
  for (let k in data) {
    if (data.hasOwnProperty(k)) {
      const key = String(k);
      validateData[key] =
        (data as any)[key] !== '' ? (data as any)[key] : undefined;
    }
  }
  return schema.validate(validateData, { abortEarly: false });
}
