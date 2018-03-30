import * as React from 'react';

import { Block } from 'components/Primitives';
import { media, SIDEBAR_WIDTH } from 'theme';

export interface SidebarInnerProps {
  children?: any;
}

export const SidebarInner: React.SFC<SidebarInnerProps> = props => {
  return (
    <Block
      css={{
        width: '100%',
        height: '100%',
        background: '#fff',
        paddingLeft: 0,
        [media.greaterThan('small')]: {
          paddingLeft: SIDEBAR_WIDTH,
        },
      }}
    >
      {props.children}
    </Block>
  );
};

SidebarInner.displayName = 'SidebarInner';
