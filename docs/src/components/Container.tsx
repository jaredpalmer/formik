import * as React from 'react';
import cn from 'classnames';

export interface ContainerProps {}

export const Container: React.FC<ContainerProps> = (props) => {
  return <div className={cn('container mx-auto')} {...props} />;
};

Container.displayName = 'Container';
