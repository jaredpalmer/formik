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
      let inheritedComponent = getPrototypeOf(sourceComponent);
      if (inheritedComponent && inheritedComponent !== objectPrototype) {
        hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
      }
    }

    let keys = getOwnPropertyNames(sourceComponent);

    if (getOwnPropertySymbols) {
      keys = keys.concat(getOwnPropertySymbols(sourceComponent) as any);
    }

    for (let i = 0; i < keys.length; ++i) {
      let key: string = keys[i];
      if (!REACT_STATICS[key] && (!blacklist || !blacklist[key])) {
        // Only hoist enumerables and non-enumerable functions
        if (
          propIsEnumerable.call(sourceComponent, key) ||
          typeof (targetComponent as any)[key] === 'function'
        ) {
          try {
            // Avoid failures from read-only properties
            (targetComponent as any)[key] = (targetComponent as any)[key];
            // tslint:disable-next-line:no-empty
          } catch (e) {}
        }
      }
    }

    return targetComponent;
  }

  return targetComponent;
}
