import * as React from 'react';
import { useFormikContext } from './FormikContext';

export type FormikFormProps = Pick<
  React.FormHTMLAttributes<HTMLFormElement>,
  Exclude<
    keyof React.FormHTMLAttributes<HTMLFormElement>,
    'onReset' | 'onSubmit'
  >
>;

export React.forwardRef(function Form(props: FormikFormProps, ref) {
  const { handleReset, handleSubmit } = useFormikContext();
  return <form onSubmit={handleSubmit} onReset={handleReset} {...props} forwardedRef={ref} />;
})

Form.displayName = 'Form';
