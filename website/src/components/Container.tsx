import * as React from 'react';
import { Block } from 'components/Primitives';

export const Container: React.SFC<any> = props => {
  return <Block margin="0 auto" maxWidth="67rem" padding="1rem" {...props} />;
};

Container.displayName = 'Container';
