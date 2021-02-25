import * as React from 'react';
import { ProgressiveImage, ProgressiveImageProps } from './ProgressiveImage';

import cn from 'classnames';

export interface LazyImageProps {
  height?: number;
  width?: number;
  alt: string;
  className?: string;
  src?: string;
  style?: object;
}

export class LazyImage extends React.Component<LazyImageProps, {}> {
  img: any;

  render() {
    const { height, width, src, alt, className, style } = this.props;

    return (
      <ProgressiveImage
        src={src}
        placeholder={
          'data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw%3D%3D'
        }
      >
        {({ image, isLoading }) => (
          <img
            className={cn(
              'transition duration-100 ease-in',
              {
                'opacity-0': isLoading,
                'opacity-100': !isLoading,
              },
              className
            )}
            src={image}
            alt={alt}
            width={width}
            style={style}
            height={height}
          />
        )}
      </ProgressiveImage>
    );
  }
}
