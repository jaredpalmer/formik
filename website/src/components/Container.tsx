import * as React from 'react';
import cn from 'classnames';
import { HTMLProps } from 'react';

export type ContainerProps = HTMLProps<HTMLDivElement>;

export const Container: React.FC<ContainerProps> = ({ className, ...props }) => {
  return <div className={cn('container mx-auto', className)} {...props} />;
};

Container.displayName = 'Container';
