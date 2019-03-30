import ExtendableError from 'es6-error';
import { FormikErrors } from './types';

export class FormikSubmitError<Values = object> extends ExtendableError {
  errors: FormikErrors<Values>;

  constructor(errors: FormikErrors<Values>) {
    super('Submission Error Occurred');
    this.errors = errors;
  }
}
