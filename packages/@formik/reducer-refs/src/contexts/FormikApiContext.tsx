import * as React from 'react';
import { FormikRefApi } from '../types';

export const FormikApiContext = React.createContext<
  FormikRefApi<any> | undefined
>(undefined);
