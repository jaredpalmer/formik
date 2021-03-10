import * as React from 'react';
import { isFunction } from './utils';
import { useFieldMeta } from './Field';

export interface ErrorMessageProps {
  name: string;
  className?: string;
  component?: string | React.ComponentType;
  children?: (errorMessage: string) => React.ReactNode;
  render?: (errorMessage: string) => React.ReactNode;
}

export const ErrorMessage = (props: ErrorMessageProps) => {
  const { component, render, children, name, ...rest } = props;
  const fieldMeta = useFieldMeta(props.name);

  const touch = fieldMeta.touched;
  const error = fieldMeta.error;

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
};
