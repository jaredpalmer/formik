import * as React from 'react';
import { forwardRefWithAs } from './utils/hooks';
import { useField } from './useField';

export type FieldConfig = React.HTMLProps<HTMLInputElement> & { name: string };

export const Field = React.memo(
  forwardRefWithAs<FieldConfig, 'input'>(function Field(
    { as: Comp = 'input', ...props },
    forwardedRef
  ) {
    const [field] = useField<any>({ ...props, as: Comp });
    return <Comp ref={forwardedRef} {...field} {...props} />;
  })
);

if (__DEV__) {
  Field.displayName = 'Field';
}
