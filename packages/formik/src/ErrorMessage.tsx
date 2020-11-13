import * as React from 'react';
import { useFieldError, useFieldTouched } from './useField';
import { isFunction } from './utils';
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
}: ErrorMessageProps) {
  const touch = useFieldTouched(name);
  const error = useFieldError(name);
  return !!touch && !!error
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
      : error
    : null;
}
