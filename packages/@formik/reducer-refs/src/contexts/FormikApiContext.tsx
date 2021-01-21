import * as React from 'react';
import { FormikRefApi } from '../hooks/useFormikApi';

export const FormikApiContext = React.createContext<
  FormikRefApi<any> | undefined
>(undefined);
