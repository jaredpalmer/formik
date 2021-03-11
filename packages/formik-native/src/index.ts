import * as React from 'react';
import { NativeSyntheticEvent, NativeTouchEvent } from 'react-native';
import { useFormikApi } from 'formik';

export function useSubmitButton() {
  const { submitForm } = useFormikApi();
  const handlePress = React.useCallback(
    (_ev: NativeSyntheticEvent<NativeTouchEvent>) => {
      submitForm();
    },
    [submitForm]
  );
  return { onPress: handlePress };
}
