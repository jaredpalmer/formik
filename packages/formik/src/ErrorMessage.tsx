import * as React from 'react';
import { isFunction } from './utils';
import { useFieldMeta } from './hooks/hooks';
import { PathOf } from './types';

export interface ErrorMessageProps<Values> {
  name: PathOf<Values>;
  className?: string;
  component?: string | React.ComponentType;
  children?: (errorMessage: string) => React.ReactNode;
  render?: (errorMessage: string) => React.ReactNode;
}

export function ErrorMessage<Values = any>({
  component,
  render,
  children,
  name,
  ...rest
}: ErrorMessageProps<Values>): JSX.Element | null {
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
};
