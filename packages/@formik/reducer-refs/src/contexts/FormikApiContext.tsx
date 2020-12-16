import * as React from 'react';
import { FormikApi } from '../types';

export const FormikApiContext = React.createContext<FormikApi<any> | undefined>(
  undefined
);
