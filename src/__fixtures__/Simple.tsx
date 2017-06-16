import * as React from 'react';

import { InjectedFormikProps } from '../.';

export interface SimpleProps {
  thing: string;
}

export function Simple({
  values,
  handleSubmit,
  handleChange,
  errors,
}: InjectedFormikProps<SimpleProps, SimpleProps>) {
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={handleChange}
        value={values.thing}
        name="thing"
      />
      {errors.thing && <div>{errors.thing}</div>}
      <input type="submit" value="Submit" />
    </form>
  );
}
