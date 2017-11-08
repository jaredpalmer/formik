/// <reference types="react" />
import { ComponentClass } from 'react';
export declare function hoistNonReactStatics<P>(
  targetComponent: ComponentClass<P>,
  sourceComponent: ComponentClass<any>,
  blacklist?: {
    [name: string]: boolean;
  }
): ComponentClass<P>
