import * as React from 'react';
import { connect } from './connect';

export type FormikFormProps = Pick<
  React.FormHTMLAttributes<HTMLFormElement>,
  Exclude<keyof React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'>
>;

export const Form = connect<FormikFormProps>(
  ({ formik: { handleSubmit }, ...props }) => (
    <form onSubmit={handleSubmit} {...props} />
  )
);

Form.displayName = 'Form';
