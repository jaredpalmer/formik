/**
 * Copyright 2017 Jared Palmer. All rights reserved.
 */
import { ComponentClass } from 'react';

const REACT_STATICS: any = {
  childContextTypes: true,
  contextTypes: true,
  defaultProps: true,
  displayName: true,
  getDefaultProps: true,
  mixins: true,
  propTypes: true,
  type: true,
};

const KNOWN_STATICS: any = {
  arguments: true,
  arity: true,
  callee: true,
  caller: true,
  length: true,
  name: true,
  prototype: true,
};

const getOwnPropertySymbols = Object.getOwnPropertySymbols;
const propIsEnumerable = Object.prototype.propertyIsEnumerable;
const getPrototypeOf = Object.getPrototypeOf;
const objectPrototype = getPrototypeOf && getPrototypeOf(Object);
const getOwnPropertyNames = Object.getOwnPropertyNames;

export function hoistNonReactStatics<P>(
  targetComponent: ComponentClass<P>,
  sourceComponent: ComponentClass<any>,
  blacklist?: { [name: string]: boolean }
): ComponentClass<P> {
  if (typeof sourceComponent !== 'string') {
    // don't hoist over string (html) components

    if (objectPrototype) {
      const inheritedComponent = getPrototypeOf(sourceComponent);
      if (inheritedComponent && inheritedComponent !== objectPrototype) {
        hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
      }
    }

    let keys = getOwnPropertyNames(sourceComponent);

    if (getOwnPropertySymbols) {
      keys = keys.concat(getOwnPropertySymbols(sourceComponent) as any);
    }

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < keys.length; ++i) {
      const key: string = keys[i];
      if (
        !REACT_STATICS[key] &&
        !KNOWN_STATICS[key] &&
        (!blacklist || !blacklist[key])
      ) {
        // Only hoist enumerables and non-enumerable functions
        if (
          propIsEnumerable.call(sourceComponent, key) ||
          typeof (sourceComponent as any)[key] === 'function'
        ) {
          try {
            // Avoid failures from read-only properties
            (targetComponent as any)[key] = (sourceComponent as any)[key];
            // tslint:disable-next-line:no-empty
          } catch (e) {}
        }
      }
    }

    return targetComponent;
  }

  return targetComponent;
}
