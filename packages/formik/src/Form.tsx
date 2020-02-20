import * as React from 'react';
import { useFormikContext } from './FormikContext';

export type FormikFormProps = Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  'onReset' | 'onSubmit'
>;

// @todo tests
export const Form = React.forwardRef<HTMLFormElement, FormikFormProps>(
  (props, ref) => {
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
