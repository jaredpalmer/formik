import * as React from 'react';
import { useFormikContext } from './FormikContext';

export type FormikFormProps = Pick<
  React.FormHTMLAttributes<HTMLFormElement>,
  Exclude<
    keyof React.FormHTMLAttributes<HTMLFormElement>,
    'onReset' | 'onSubmit'
  >
>;

export function Form(props: FormikFormProps) {
  const { handleReset, handleSubmit } = useFormikContext();
  return <form onSubmit={handleSubmit} onReset={handleReset} {...props} />;
}

Form.displayName = 'Form';
