import * as React from 'react';

export interface ProgressiveImageProps {
  children: (props: ProgressiveImageState) => React.ReactNode;
  onError?: (errorEvent: Event) => void;
  placeholder: string;
  src?: string;
}

export interface ProgressiveImageState {
  image: string;
  isLoading: boolean;
  naturalHeight?: number;
  naturalWidth?: number;
  aspectRatio?: number;
  orientation?: 'landscape' | 'portrait';
}

export class ProgressiveImage extends React.Component<
  ProgressiveImageProps,
  ProgressiveImageState
> {
  image: HTMLImageElement | any;
  constructor(props: ProgressiveImageProps) {
    super(props);
    this.state = {
      image: props.placeholder,
      isLoading: true,
    };
  }

  componentDidMount() {
    const { src } = this.props;
    if (src) {
      this.loadImage(src);
    }
  }

  componentDidUpdate(prevProps: ProgressiveImageProps) {
    const { src, placeholder } = prevProps;
    // We only invalidate the current image if the src has changed.
    if (src && src !== this.props.src) {
      this.setState({ image: placeholder, isLoading: true }, () => {
        this.loadImage(src);
      });
    }
  }

  componentWillUnmount() {
    if (this.image) {
      this.image.onload = null;
      this.image.onerror = null;
    }
  }

  loadImage = (src: string) => {
    // If there is already an image we nullify the onload
    // and onerror props so it does not incorrectly set state
    // when it resolves
    if (this.image) {
      this.image.onload = null;
      this.image.onerror = null;
    }
    const image = new Image();
    this.image = image;
    image.onload = this.onLoad;
    (image as any).onerror = this.onError;
    image.src = src;
  };

  onLoad = () => {
    const { naturalWidth, naturalHeight } = this.image;
    // use this.image.src instead of this.props.src to
    // avoid the possibility of props being updated and the
    // new imageisLoading before the new props are available as
    // this.props.
    this.setState({
      naturalHeight,
      naturalWidth,
      aspectRatio: naturalHeight / naturalWidth,
      orientation: naturalWidth > naturalHeight ? 'landscape' : 'portrait',
      image: this.image.src,
      isLoading: false,
    });
  };

  onError = (errorEvent: Event) => {
    const { onError } = this.props;
    if (onError) {
      onError(errorEvent);
    }
  };

  render() {
    const { children } = this.props;
    if (!children || typeof children !== 'function') {
      throw new Error(`ProgressiveImage requires a function as its only child`);
    }
    return children(this.state);
  }
}
