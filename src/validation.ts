import { FieldValidator } from './types';
import { FieldAttributes } from './field-types';

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

const requiredTest: () => Test = () => ({
  test: (context: ValidationContext) => context.isEmpty(),
  message: (context: ValidationContext) => `The ${context.name} is required`,
});

const minLengthTest = (minLength: number) => ({
  test: (context: ValidationContext) =>
    !context.isEmpty() && context.value.length < minLength,
  message: (context: ValidationContext) =>
    `The ${context.name} length must be at least ${minLength}.`,
});

const maxLengthTest = (maxLength: number) => ({
  test: (context: ValidationContext) =>
    !context.isEmpty() && context.value.length > maxLength,
  message: (context: ValidationContext) =>
    `The ${context.name} must be no more than ${maxLength}.`,
});

const numericTest = () => ({
  test: (context: ValidationContext) =>
    !context.isEmpty() && !context.isNumeric(),
  message: (context: ValidationContext) =>
    `The ${context.name} is not a valid number`,
});

const minTest = (min: number) => ({
  test: (context: ValidationContext) =>
    !context.empty && context.isNumeric() && Number(context.value) < min,
  message: (context: ValidationContext) =>
    `The ${context.name} must be at least ${min}.`,
});

const maxTest = (max: number) => ({
  test: (context: ValidationContext) =>
    !context.empty && context.isNumeric() && Number(context.value) > max,
  message: (context: ValidationContext) =>
    `The ${context.name} must be no greater than ${max}.`,
});

const equalTest = (value: any) => ({
  test: (context: ValidationContext) =>
    !context.empty && context.value == value,
  message: (context: ValidationContext) =>
    `The ${context.name} must be equal to ${value}.`,
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
    plan.push(requiredTest());
  }
  if (constraints.minLength) {
    plan.push(minLengthTest(constraints.minLength));
  }
  if (constraints.maxLength) {
    plan.push(maxLengthTest(constraints.maxLength));
  }
  if (constraints.numeric) {
    plan.push(numericTest());
  }
  if (constraints.min) {
    plan.push(minTest(constraints.min));
  }
  if (constraints.max) {
    plan.push(maxTest(constraints.max));
  }
  if (constraints.equal) {
    plan.push(equalTest(constraints.equal));
  }

  return plan;
}

function executePlan(context: ValidationContext, testPlan: Test[]) {
  let length = testPlan.length;

  if (length > 0) {
    for (var index = 0; index < length; index++) {
      if (testPlan[index].test(context)) {
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

        const errorMessage = executePlan(context, testPlan);

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
