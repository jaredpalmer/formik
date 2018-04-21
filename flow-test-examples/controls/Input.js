/* @flow */
import * as React from 'react';
import { Input } from 'postcss';

type Props = {
  +value: string | null,
  +onChange?: (evt: SyntheticInputEvent<HTMLInputElement>) => void,
  +onBlur?: (evt: SyntheticEvent<HTMLInputElement>) => void,
  +error?: boolean,
  +helperText?: ?string,
};
// (e: SyntheticInputEvent<any>) => void
export default ({ value, onChange, error, helperText, onBlur }: Props) => (
  <div>
    <div>
      <input type="text" value={value} onChange={onChange} onBlur={onBlur} />
    </div>
    {error === true && (
      <div> {helperText != null ? helperText : 'Unknown Error'} </div>
    )}
  </div>
);
