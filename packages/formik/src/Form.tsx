import * as React from 'react';
import { forwardRefWithAs } from 'utils/forwardWithRefAs';
import { useFormikContext } from 'FormikContext';

export type FormProps = Omit<React.HTMLProps<HTMLFormElement>, 'onSubmit'>;

export const Form = forwardRefWithAs<FormProps, 'form'>(function Form(
  { as: Comp = 'form', ...props },
  forwardedRef
) {
  const { handleSubmit } = useFormikContext();
  return <Comp onSubmit={handleSubmit} {...props} ref={forwardedRef} />;
});

if (__DEV__) {
  Form.displayName = 'Form';
}
