import { useEffect } from 'react';
import { useFormikContext } from 'formik';

import { isFirstIn } from './utils';

/**
 * This hook checks if the given name appears first in the errors object and if it is then scrolls to that element and
 * optionally brings it in focus if it is an input element.
 * @param name
 * @param scrollRef
 * @param focusRef
 */

export const useOnFirstError = (
  name: string,
  scrollRef: React.RefObject<HTMLElement>,
  focusRef?: React.RefObject<HTMLInputElement>
) => {
  const { errors, isSubmitting, isValidating } = useFormikContext();

  useEffect(() => {
    if (isSubmitting && !isValidating && isFirstIn(errors, name)) {
      focusRef?.current?.focus();
      scrollRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [errors, name, isSubmitting, isValidating, scrollRef, focusRef]);
};
