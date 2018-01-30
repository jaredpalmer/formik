import * as React from 'react';
import { Block } from 'components/Primitives';

export const Card: React.SFC<any> = props => {
  return (
    <Block
      padding="1rem"
      background="#fff"
      boxShadow="0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08)"
      borderRadius={4}
      {...props}
    />
  );
};

Card.displayName = 'Card';
