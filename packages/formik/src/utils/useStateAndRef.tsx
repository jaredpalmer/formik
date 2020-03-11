/**
 * Copyright (c) Formik, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { useEventCallback } from './useEventCallback';

export function useStateAndRef<T>(
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, React.MutableRefObject<T>] {
  const ref = React.useRef<T>(initialValue);
  const [state, setState] = React.useState<T>(initialValue);
  const update = useEventCallback(v => {
    ref.current = v;
    setState(v);
  });
  return [state, update, ref];
}
