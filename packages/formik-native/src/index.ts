import * as React from 'react';
import { NativeSyntheticEvent, NativeTouchEvent } from 'react-native';
import { useFormikContext } from 'formik';

export function useSubmitButton() {
  const { submitForm } = useFormikContext();
  const handlePress = React.useCallback(
    (_ev: NativeSyntheticEvent<NativeTouchEvent>) => {
      submitForm();
    },
    [submitForm]
  );
  return { onPress: handlePress };
}
