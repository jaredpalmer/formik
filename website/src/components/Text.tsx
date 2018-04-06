import * as React from 'react';
import { InlineBlock } from 'components/Primitives';
import { TYPE_SCALE } from 'theme';

export const Text: React.SFC<any> = props => {
  return <InlineBlock fontSize={TYPE_SCALE[props.size]} {...props} />;
};

Text.displayName = 'Text';
