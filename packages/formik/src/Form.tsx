import * as React from 'react';
import { useFormikContext } from './FormikContext';

export type FormikFormProps = Pick<
  React.FormHTMLAttributes<HTMLFormElement>,
  Exclude<
    keyof React.FormHTMLAttributes<HTMLFormElement>,
    'onReset' | 'onSubmit'
  >
>;

type FormProps = React.ComponentPropsWithoutRef<'form'>;

// @todo tests
export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  (props: FormikFormProps, ref) => {
    // iOS needs an "action" attribute for nice input: https://stackoverflow.com/a/39485162/406725
    // We default the action to "#" in case the preventDefault fails (just updates the URL hash)
    const { action, ...rest } = props;
    const _action = action || '#';
    const { handleReset, handleSubmit } = useFormikContext();
    return (
      <form
        onSubmit={handleSubmit}
        ref={ref}
        onReset={handleReset}
        action={_action}
        {...rest}
      />
    );
  }
);

Form.displayName = 'Form';
