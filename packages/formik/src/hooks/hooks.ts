import { useFormikContext } from '../FormikContext';
import { useMemo } from 'react';
import {
  selectFieldMetaByName,
} from '../helpers/field-helpers';
import { FieldMetaProps, FormikState } from '../types';
import { useFormikState } from './useFormikState';
import { isShallowEqual } from '../utils';

/**
 * Returns @see FieldMetaProps<Value>
 */
export const useFieldMeta = <Value>(name: string): FieldMetaProps<Value> => {
  const [fieldMeta] = useFormikState(
    useMemo(() => selectFieldMetaByName(name), [name]),
    isShallowEqual
  );

  return fieldMeta;
};

const selectIsDirty = (state: FormikState<any>) => state.dirty;
export const useIsDirty = () => useFormikContext().useState(selectIsDirty);

const selectIsValid = (state: FormikState<any>) => state.isValid;
export const useIsValid = () => useFormikContext().useState(selectIsValid);
