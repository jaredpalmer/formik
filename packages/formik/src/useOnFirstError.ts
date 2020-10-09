import { useEffect } from 'react'
import { useFormikContext } from 'formik'

import { isFirstIn } from './utils'

export const useOnFirstError = (
  name: string,
  scrollRef: React.RefObject<HTMLElement>,
  focusRef?: React.RefObject<HTMLInputElement>
) => {
  const { errors, isSubmitting, isValidating } = useFormikContext()

  useEffect(() => {
    if (isSubmitting && !isValidating && isFirstIn(errors, name)) {
      focusRef?.current?.focus()
      scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    }
  }, [errors, name, isSubmitting, isValidating, scrollRef, focusRef])
}