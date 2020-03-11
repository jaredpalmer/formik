/** Simple field validation fn */
export type ValidatorFn = (value: any) => string | undefined;

/**
 * Field state, helper methods, and config that will be registered
 * to the parent context.
 */
export interface FieldStateAndOperations<V = unknown> {
  value: V;
  touched: boolean;
  error?: string;
  validate: ValidatorFn;
  setError: (err?: string) => void;
  setValue: (val?: any) => void;
  setTouched: (isTouched: boolean) => void;
}
