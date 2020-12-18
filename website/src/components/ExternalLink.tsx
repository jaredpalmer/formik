import * as React from 'react';

export function ExternalLink(props: any) {
  return <a {...props} rel="noopener" target={props.target || '_blank'} />;
}
