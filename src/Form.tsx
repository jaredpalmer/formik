import * as React from 'react';
import { connect } from './connect';

export type FormikFormProps = Pick<
  React.FormHTMLAttributes<HTMLFormElement>,
  Exclude<
    keyof React.FormHTMLAttributes<HTMLFormElement>,
    'onReset' | 'onSubmit'
  >
>;

const FormInner = ({ formik: { handleReset, handleSubmit }, ...props }) => (
  <form onReset={handleReset} onSubmit={handleSubmit} {...props} />
);

FormInner.displayName = 'Form';

export const Form = connect<FormikFormProps>(FormInner);
