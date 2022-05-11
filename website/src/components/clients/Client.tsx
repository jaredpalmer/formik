import React from 'react';
import Image from 'next/image';

interface ClientProps {
  name: string;
  image: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Client = React.memo<ClientProps>(
  ({ name, image, style, ...rest }) => (
    <span title={name} {...rest}>
      <Image
        src={image}
        alt={name}
        width={style?.width ?? style?.maxWidth ?? 175}
        height={style?.height ?? 75}
        loading="lazy"
        className="inline"
      />
    </span>
  )
);
