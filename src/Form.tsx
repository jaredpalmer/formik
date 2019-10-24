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
  // iOS needs an "action" attribute for nice input: https://stackoverflow.com/a/39485162/406725
  // We default the action to "#" in case the preventDefault fails (just updates the URL hash)
  const { action, ...rest } = props;
  const _action = action || "#"
  const { handleReset, handleSubmit } = useFormikContext();
  return <form onSubmit={handleSubmit} onReset={handleReset} action={_action} {...rest} />;
}

Form.displayName = 'Form';
