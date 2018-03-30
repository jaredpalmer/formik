import * as React from 'react';
import { IcCapsule } from 'components/Icon/IcCapsule';
import { IcSmyte } from 'components/Icon/IcSmyte';
import { IcDocker } from 'components/Icon/IcDocker';
import { IcOpenTable } from 'components/Icon/IcOpenTable';

const nameToIcon = {
  capsule: IcCapsule,
  smyte: IcSmyte,
  docker: IcDocker,
  opentable: IcOpenTable,
};

export interface IconProps {
  name: keyof typeof nameToIcon;
  height?: number;
  width?: number;
}

export const Icon: React.SFC<any> = ({ name, ...props }) => {
  const Component = nameToIcon[name];
  return <Component {...props} />;
};

Icon.displayName = 'Icon';
