import React from 'react';
import Image from 'next/image';

interface ClientProps {
  name: string;
  image: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Client = React.memo<ClientProps>(
  ({ name, image, style = {}, ...rest }) => {
    const { height, width, maxWidth } = style;

    const computedWidth =
      typeof width === 'number'
        ? width
        : typeof maxWidth === 'number'
        ? maxWidth
        : 175;

    const computedHeight = typeof height === 'number' ? height : 75;

    const userHasBoth =
      height !== undefined && (width !== undefined || maxWidth !== undefined);

    const computedStyle = {
      maxWidth: '100%',
      height: 'auto',
      ...(userHasBoth
        ? {}
        : { aspectRatio: `${computedWidth} / ${computedHeight}` }),
      ...style,
    };

    return (
      <span title={name} {...rest}>
        <Image
          src={image}
          alt={name}
          width={computedWidth}
          height={computedHeight}
          loading="lazy"
          className="inline"
          style={computedStyle}
        />
      </span>
    );
  }
);