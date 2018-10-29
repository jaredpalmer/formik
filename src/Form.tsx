import * as React from 'react';
import { connect } from './connect';

export type FormikFormProps = {
  innerRef: (instance: any) => void;
} & Pick<
  React.FormHTMLAttributes<HTMLFormElement>,
  Exclude<
    keyof React.FormHTMLAttributes<HTMLFormElement>,
    'onReset' | 'onSubmit'
  >
>;

export const Form = connect<FormikFormProps>(
  ({ formik: { handleReset, handleSubmit }, innerRef, ...props }) => (
    <form
      onReset={handleReset}
      onSubmit={handleSubmit}
      ref={innerRef}
      {...props}
    />
  )
);

Form.displayName = 'Form';
