import { FieldValidator } from './types';
import { FieldAttributes, FieldConstraints } from './fieldTypes';

interface Test {
  test: (context: ValidationContext) => boolean;
  message: (context: ValidationContext) => string;
}

const constraintNames = [
  'required',
  'minLength',
  'maxLength',
  'numeric',
  'min',
  'max',
  'equal',
  'isEmail',
  'match',
  'validate',
];

function constraintToTouple<T>(constraint: T | [T, string]): [T, string] {
  return Array.isArray(constraint)
    ? (constraint as [T, string])
    : [constraint, (undefined as unknown) as string];
}

/**
 * Used to isolate the constrains from the props so that we can use it
 * to detect changes.
 *
 * @param props
 */
export function createConstraints<Val = any>({
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

type ConstraintLookup = { [id: string]: any };

export function constraintsToArray(constraints: FieldConstraints) {
  const c: ConstraintLookup = constraints;
  return constraintNames.map(name => constraintToTouple(c[name])).flat();
}

export function constraintsHaveChanged(
  previous: FieldConstraints,
  current: FieldConstraints
) {
  const p: ConstraintLookup = previous;
  const c: ConstraintLookup = current;
  return constraintNames.some(name => p[name] != c[name]);
}

/**
 * This is used to remove constraints from the props so that the elements
 * don't end up in the dom.
 * @param props
 */
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

const requiredConstraint = (arg: [boolean, string]) => {
  const [required, message] = arg;
  const msgFn =
    message == undefined
      ? (context: ValidationContext) => `The ${context.name} is required`
      : (_: ValidationContext) => message;
  return {
    test: (context: ValidationContext) => required && !context.isEmpty(),
    message: msgFn,
  };
};

const minLengthConstraint = (arg: [number, string]) => {
  const [minLength, message] = arg;
  const msgFn =
    message == undefined
      ? (context: ValidationContext) =>
          `${context.name} length must be at least ${minLength} characters long.`
      : (_: ValidationContext) => message;

  return {
    test: (context: ValidationContext) =>
      !context.isEmpty() && context.value.length >= minLength,
    message: msgFn,
  };
};

const maxLengthConstraint = (arg: [number, string]) => {
  const [maxLength, message] = arg;
  const msgFn =
    message == undefined
      ? (context: ValidationContext) =>
          `${context.name} must be no more than ${maxLength} characters long.`
      : (_: ValidationContext) => message;

  return {
    test: (context: ValidationContext) =>
      !context.isEmpty() && context.value.length <= maxLength,
    message: msgFn,
  };
};

const numericConstraint = (arg: [boolean, string]) => {
  const [test, message] = arg;
  const msgFn =
    message == undefined
      ? (context: ValidationContext) => `${context.name} is not a valid number`
      : (_: ValidationContext) => message;

  return {
    test: (context: ValidationContext) =>
      test && !context.isEmpty() && context.isNumeric(),
    message: msgFn,
  };
};

const minConstraint = (arg: [number, string]) => {
  const [min, message] = arg;
  const msgFn =
    message == undefined
      ? (context: ValidationContext) =>
          `${context.name} must be at least ${min}.`
      : (_: ValidationContext) => message;

  return {
    test: (context: ValidationContext) =>
      !context.empty && context.isNumeric() && Number(context.value) >= min,
    message: msgFn,
  };
};

const maxConstraint = (arg: [number, string]) => {
  const [max, message] = arg;
  const msgFn =
    message == undefined
      ? (context: ValidationContext) =>
          `${context.name} must be no greater than ${max}.`
      : (_: ValidationContext) => message;

  return {
    test: (context: ValidationContext) =>
      !context.empty && context.isNumeric() && Number(context.value) <= max,
    message: msgFn,
  };
};

const equalConstraint = (arg: [any, string]) => {
  const [value, message] = arg;
  const msgFn =
    message == undefined
      ? (context: ValidationContext) =>
          `${context.name} does not equal ${value}.`
      : (_: ValidationContext) => message;

  return {
    test: (context: ValidationContext) =>
      !context.empty && context.value == value,
    message: msgFn,
  };
};

const emailConstraint = (arg: [boolean, string]) => {
  const [test, message] = arg;
  const msgFn =
    message == undefined
      ? (context: ValidationContext) =>
          `${context.name} is not a valid email address`
      : (_: ValidationContext) => message;

  return {
    test: (context: ValidationContext) =>
      test &&
      !context.isEmpty() &&
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        context.value
      ),
    message: msgFn,
  };
};

const matchConstraint = (arg: [string, string]) => {
  const [pattern, message] = arg;
  const msgFn =
    message == undefined
      ? (context: ValidationContext) => `${context.name} is invalid`
      : (_: ValidationContext) => message;

  return {
    test: (context: ValidationContext) =>
      !context.isEmpty() && new RegExp(pattern).test(context.value),
    message: msgFn,
  };
};

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
    plan.push(requiredConstraint(constraintToTouple(constraints.required)));
  }
  if (constraints.minLength) {
    plan.push(minLengthConstraint(constraintToTouple(constraints.minLength)));
  }
  if (constraints.maxLength) {
    plan.push(maxLengthConstraint(constraintToTouple(constraints.maxLength)));
  }
  if (constraints.numeric) {
    plan.push(numericConstraint(constraintToTouple(constraints.numeric)));
  }
  if (constraints.min) {
    plan.push(minConstraint(constraintToTouple(constraints.min)));
  }
  if (constraints.max) {
    plan.push(maxConstraint(constraintToTouple(constraints.max)));
  }
  if (constraints.equal) {
    plan.push(equalConstraint(constraintToTouple(constraints.equal)));
  }
  if (constraints.isEmail) {
    plan.push(emailConstraint(constraintToTouple(constraints.isEmail)));
  }
  if (constraints.match) {
    plan.push(matchConstraint(constraintToTouple(constraints.match)));
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

export function createValidator(
  name: string,
  constraints: FieldConstraints
): FieldValidator {
  const { validate } = constraints;
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
