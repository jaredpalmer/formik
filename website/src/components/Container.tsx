import * as React from 'react';
import cn from 'classnames';
import { HTMLProps } from 'react';

export const Container: React.FC<JSX.IntrinsicElements['div']> = ({
  className,
  ...props
}) => {
  return <div className={cn('container mx-auto', className)} {...props} />;
};

Container.displayName = 'Container';
