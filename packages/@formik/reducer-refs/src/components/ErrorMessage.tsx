import { isFunction } from '@formik/core';
import * as React from 'react';
import { useFieldMeta } from '../hooks/hooks';

export interface ErrorMessageProps {
  name: string;
  className?: string;
  component?: string | React.ComponentType;
  children?: (errorMessage: string) => React.ReactNode;
  render?: (errorMessage: string) => React.ReactNode;
}

export function ErrorMessage({
  component,
  render,
  children,
  name,
  ...rest
}: ErrorMessageProps): JSX.Element | null {
  const { touched, error } = useFieldMeta(name);

  return !!touched && !!error
    ? render
      ? isFunction(render)
        ? render(error)
        : null
      : children
      ? isFunction(children)
        ? children(error)
        : null
      : component
      ? React.createElement(component, rest as any, error)
      : (error as any)
    : null;
}
