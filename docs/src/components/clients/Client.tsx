import React from 'react';

import { LazyImage } from '../LazyImage';

interface ClientProps {
  name: string;
  image: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Client = React.memo<ClientProps>(
  ({ name, image, style, ...rest }) => (
    <span title={name} {...rest}>
      <LazyImage
        src={image}
        alt={name}
        width={150}
        style={style}
        className="inline"
      />
    </span>
  )
);
