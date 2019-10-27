import { FieldValidator } from './types';
import { FieldAttributes } from './fieldTypes';

interface Test {
  test: (context: ValidationContext) => boolean;
  message: (context: ValidationContext) => string;
}

export interface FieldConstraints {
  name?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  numeric?: boolean;
  min?: number;
  max?: number;
  equal?: any;
  isEmail?: boolean;
  match?: string;

  validate?: FieldValidator;
}

export function createConstraints<Val = any>({
  name,
  required,
  minLength,
  maxLength,
  numeric,
  min,
  max,
  equal,
  isEmail,
  match,
  validate,
}: FieldAttributes<Val>): FieldConstraints {
  return {
    name: name === undefined ? 'field' : name,
    required,
    minLength,
    maxLength,
    numeric,
    min,
    max,
    equal,
    isEmail,
    match,
    validate,
  };
}

export function removeConstraints<Val = any>({
  required,
  minLength,
  maxLength,
  numeric,
  min,
  max,
  equal,
  isEmail,
  match,
  ...rest
}: FieldAttributes<Val>) {
  return rest;
}

class ValidationContext {
  value: any;
  name: string;

  empty: boolean = true;
  numeric?: boolean = undefined;

  isEmpty() {
    return this.empty;
  }

  isNumeric() {
    if (this.numeric == undefined) {
      this.numeric = !Number.isNaN(Number(this.value));
    }

    return this.numeric;
  }

  constructor(n: string = 'field', v: any) {
    this.value = v;
    this.name = n;
    this.empty = isEmpty(v);
  }
}

const requiredConstraint: () => Test = () => ({
  test: (context: ValidationContext) => !context.isEmpty(),
  message: (context: ValidationContext) => `The ${context.name} is required`,
});

const minLengthConstraint = (minLength: number) => ({
  test: (context: ValidationContext) =>
    !context.isEmpty() && context.value.length >= minLength,
  message: (context: ValidationContext) =>
    `${context.name} length must be at least ${minLength} characters long.`,
});

const maxLengthConstraint = (maxLength: number) => ({
  test: (context: ValidationContext) =>
    !context.isEmpty() && context.value.length <= maxLength,
  message: (context: ValidationContext) =>
    `${context.name} must be no more than ${maxLength} characters long.`,
});

const numericConstraint = (test: boolean) => ({
  test: (context: ValidationContext) =>
    test && !context.isEmpty() && context.isNumeric(),
  message: (context: ValidationContext) =>
    `${context.name} is not a valid number`,
});

const minConstraint = (min: number) => ({
  test: (context: ValidationContext) =>
    !context.empty && context.isNumeric() && Number(context.value) >= min,
  message: (context: ValidationContext) =>
    `${context.name} must be at least ${min}.`,
});

const maxConstraint = (max: number) => ({
  test: (context: ValidationContext) =>
    !context.empty && context.isNumeric() && Number(context.value) <= max,
  message: (context: ValidationContext) =>
    `${context.name} must be no greater than ${max}.`,
});

const equalConstraint = (value: any) => ({
  test: (context: ValidationContext) =>
    !context.empty && context.value == value,
  message: (context: ValidationContext) =>
    `${context.name} does not equal ${value}.`,
});

const emailConstraint = (test: boolean) => ({
  test: (context: ValidationContext) =>
    test &&
    !context.isEmpty() &&
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      context.value
    ),
  message: (context: ValidationContext) => `${context.name} is not valid`,
});

const matchConstraint = (pattern: string) => ({
  test: (context: ValidationContext) =>
    !context.isEmpty() && new RegExp(pattern).test(context.value),
  message: (context: ValidationContext) => `${context.name} is invalid`,
});

function isEmpty(value: any) {
  return value === undefined || value === '' || value === null;
}

/**
 * In the future, with a large number of tests, performance could suffer. Creating a
 * test plan will generally improve performance .
 * @param constraints
 */
function createTestPlan(constraints: FieldConstraints) {
  let plan: Array<Test> = []; // no plans

  if (constraints.required) {
    plan.push(requiredConstraint());
  }
  if (constraints.minLength) {
    plan.push(minLengthConstraint(constraints.minLength));
  }
  if (constraints.maxLength) {
    plan.push(maxLengthConstraint(constraints.maxLength));
  }
  if (constraints.numeric) {
    plan.push(numericConstraint(constraints.numeric));
  }
  if (constraints.min) {
    plan.push(minConstraint(constraints.min));
  }
  if (constraints.max) {
    plan.push(maxConstraint(constraints.max));
  }
  if (constraints.equal) {
    plan.push(equalConstraint(constraints.equal));
  }
  if (constraints.isEmail) {
    plan.push(emailConstraint(constraints.isEmail));
  }
  if (constraints.match) {
    plan.push(matchConstraint(constraints.match));
  }

  return plan;
}

function executeTestPlan(context: ValidationContext, testPlan: Test[]) {
  let length = testPlan.length;

  if (length > 0) {
    for (var index = 0; index < length; index++) {
      if (!testPlan[index].test(context)) {
        return testPlan[index].message(context);
      }
    }
  }
  return undefined;
}

export function createValidator(constraints: FieldConstraints): FieldValidator {
  const { name, validate } = constraints;
  const testPlan = createTestPlan(constraints);

  return (value: any) =>
    new Promise<string | void>(async (resolve, _) => {
      try {
        const context = new ValidationContext(name, value);

        const errorMessage = executeTestPlan(context, testPlan);

        if (!!errorMessage) resolve(errorMessage);
        else if (validate) {
          resolve(await validate(value));
        } else {
          resolve(undefined);
        }
      } catch (error) {
        console.error('Validation failed', error);
        resolve(undefined);
      }
    });
}
