import { useFormikContext } from '../FormikContext';
import { useMemo } from 'react';
import {
  fieldMetaIsEqual,
  selectFieldMetaByName,
} from '../helpers/field-helpers';
import { FieldMetaProps } from '../types';
import { useFormikState } from './useFormikState';

/**
 * Returns @see FieldMetaProps<Value>
 */
export const useFieldMeta = <Value>(name: string): FieldMetaProps<Value> => {
  const [fieldMeta] = useFormikState(
    useMemo(() => selectFieldMetaByName(name), [name]),
    fieldMetaIsEqual
  );

  return fieldMeta;
};

export const useIsDirty = () => useFormikContext().useComputedState().dirty;

export const useIsValid = () => useFormikContext().useComputedState().isValid;
