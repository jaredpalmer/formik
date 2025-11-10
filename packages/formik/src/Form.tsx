import * as React from 'react';
import { useFormikContext } from './FormikContext';

export type FormikFormProps = Pick<
  React.FormHTMLAttributes<HTMLFormElement>,
  Exclude<
    keyof React.FormHTMLAttributes<HTMLFormElement>,
    'onReset' | 'onSubmit'
  >
>;


// Type alias for a standard <form> element props without refs
type FormProps = React.ComponentPropsWithoutRef<'form'>;

// @todo tests
export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  (props: FormikFormProps, ref) => {
    // iOS needs an "action" attribute for nice input: https://stackoverflow.com/a/39485162/406725
    // We default the action to "#" in case the preventDefault fails (just updates the URL hash)
    const { action, ...rest } = props;
    const _action = action ?? '#';

    // Get Formik handlers from context
    const { handleReset, handleSubmit } = useFormikContext();

    return (
      <form
        ref={ref}
        onReset={handleReset}
        action={_action}
        onSubmit={(event) => {
          // Run native HTML5 validation first
          const form = event.currentTarget;
          if (!form.reportValidity()) {
            // Stop Formik from submitting if native validation fails
            event.preventDefault();
            return;
          }

          // Proceed with Formik submit
          handleSubmit(event);
        }}
        {...rest}
      />
    );
  }
);

// For better DevTools display name
Form.displayName = 'Form';
