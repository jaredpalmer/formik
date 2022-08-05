import * as React from 'react';
import isEqual from 'react-fast-compare';
import { useFormikContext } from './FormikContext';
import { FormikEvents, FormikContextType } from './types';

export type FormikSelector<Values, RT = unknown> = (
  formik: FormikContextType<Values>
) => RT;

export function useFormikSelector<Values, RT = unknown>(
  selector: FormikSelector<Values, RT>
) {
  const formik = useFormikContext<Values>();
  const [, setForceUpdate] = React.useState(false);
  const valueRef = React.useRef<RT>(selector(formik));

  React.useEffect(
    () =>
      formik.eventManager.on(FormikEvents.stateUpdate, (_, formik) => {
        const newValue = selector(formik);

        if (!isEqual(newValue, valueRef.current)) {
          valueRef.current = newValue;
          setForceUpdate(p => !p);
        }
      }),
    [formik]
  );

  return valueRef.current;
}
