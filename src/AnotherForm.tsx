import * as React from 'react';
import { connect } from './connect';

export type FormikFormProps = Pick<
  React.FormHTMLAttributes<HTMLFormElement>,
  Exclude<
    keyof React.FormHTMLAttributes<HTMLFormElement>,
    'onReset' | 'onSubmit'
  >
>;

export const AnotherForm = connect<FormikFormProps>(
  ({ formik: { handleReset, handleSubmit }, ...props }) => (
    <React.Fragment>
      <h2>Another Form</h2>
      <form onReset={handleReset} onSubmit={handleSubmit} {...props} />
    </React.Fragment>
  )
);

AnotherForm.displayName = 'AnotherForm';
