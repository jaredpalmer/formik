import { useFormikContext } from '../FormikContext';
import { useMemo } from 'react';
import {
  selectFieldMetaByName,
} from '../helpers/field-helpers';
import { FieldMetaProps } from '../types';
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

export const useIsDirty = () => useFormikContext().useComputedState().dirty;

export const useIsValid = () => useFormikContext().useComputedState().isValid;
