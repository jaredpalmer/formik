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

export const ENTER_KEY_CODE = 13;

// @todo tests
export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  (props: FormikFormProps, ref) => {
    // iOS needs an "action" attribute for nice input: https://stackoverflow.com/a/39485162/406725
    // We default the action to "#" in case the preventDefault fails (just updates the URL hash)
    const { action, ...rest } = props;
    const _action = action ?? '#';
    const {
      handleReset,
      handleSubmit,
      preventStickingSubmissions,
    } = useFormikContext();
    const allowSubmit = React.useRef(true);
    const handleKeyUp = ({ keyCode }: React.KeyboardEvent<HTMLFormElement>) => {
      if (keyCode === ENTER_KEY_CODE && preventStickingSubmissions) {
        allowSubmit.current = true;
      }
    };
    const submitWrap = (ev: React.FormEvent<HTMLFormElement>) => {
      if (allowSubmit.current) {
        handleSubmit(ev);
        if (preventStickingSubmissions) {
          allowSubmit.current = false;
        }
      } else {
        ev.preventDefault();
      }
    };
    return (
      <form
        onKeyUp={handleKeyUp}
        onSubmit={submitWrap}
        ref={ref}
        onReset={handleReset}
        action={_action}
        {...rest}
      />
    );
  }
);

Form.displayName = 'Form';
