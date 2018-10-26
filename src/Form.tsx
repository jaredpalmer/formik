import * as React from 'react';
import { connect } from './connect';

export type FormikFormProps = Pick<
  React.FormHTMLAttributes<HTMLFormElement>,
  Exclude<
    keyof React.FormHTMLAttributes<HTMLFormElement>,
    'onReset' | 'onSubmit'
  >
>;

export const Form = connect<FormikFormProps>(
  ({ formik: { handleReset, handleSubmit }, ...props }) => (
    <form onReset={handleReset} onSubmit={handleSubmit} {...props} />
  )
);

Form.displayName = 'Form';
