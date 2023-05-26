import React from 'react';
import Image from 'next/legacy/image';

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
        width={style?.width ?? style?.maxWidth ?? (175 as any)}
        height={style?.height ?? (75 as any)}
        loading="lazy"
        className="inline"
      />
    </span>
  )
);
