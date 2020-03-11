/**
 * Copyright (c) Formik, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from 'react';

const noopReducer = (s: number) => s + 1;

export function useForceRender() {
  const [, forceRender] = React.useReducer(noopReducer, 0);
  return forceRender;
}

// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser.
// @see https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
    ? React.useLayoutEffect
    : React.useEffect;

/**
 * Akin to an instance variable on a class, this method keeps referential equality of a fn
 * between renders.
 *
 * @param fn callback function
 */
export function useEventCallback<T extends (...args: any[]) => any>(fn: T): T {
  const ref: any = React.useRef(fn);
  // we copy a ref to the callback scoped to the current state/props on each render
  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  });
  return React.useCallback(
    (...args: any[]) => ref.current.apply(void 0, args),
    []
  ) as T;
}

/**
 * Like React.useState, but it keeps value in a ref as well for reading.
 */
export function useStateAndRef<T>(
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, React.MutableRefObject<T>] {
  const ref = React.useRef<T>(initialValue);
  const [state, setState] = React.useState<T>(initialValue);
  const update = useEventCallback(v => {
    ref.current = v;
    setState(v);
  });
  return [state, update, ref];
}

/**
 * React.Ref uses the readonly type `React.RefObject` instead of
 * `React.MutableRefObject`, We pretty much always assume ref objects are
 * mutable (at least when we create them), so this type is a workaround so some
 * of the weird mechanics of using refs with TS.
 */
export type AssignableRef<ValueType> =
  | {
      bivarianceHack(instance: ValueType | null): void;
    }['bivarianceHack']
  | React.MutableRefObject<ValueType | null>
  | null;

/**
 * Wraps a lib-defined event handler and a user-defined event handler, returning
 * a single handler that allows a user to prevent lib-defined handlers from
 * firing.
 *
 * @param theirHandler User-supplied event handler
 * @param ourHandler Library-supplied event handler
 */
export function wrapEvent<EventType extends React.SyntheticEvent | Event>(
  theirHandler: ((event: EventType) => any) | undefined,
  ourHandler: (event: EventType) => any
): (event: EventType) => any {
  return event => {
    theirHandler && theirHandler(event);
    if (!event.defaultPrevented) {
      return ourHandler(event);
    }
  };
}

////////////////////////////////////////////////////////////////////////////////
// The following types help us deal with the `as` prop.
// I kind of hacked around until I got this to work using some other projects,
// as a rough guide, but it does seem to work so, err, that's cool? Yay TS! 🙃
// P = additional props
// T = type of component to render

export type As<BaseProps = any> = React.ElementType<BaseProps>;

export type PropsWithAs<
  ComponentType extends As,
  ComponentProps
> = ComponentProps &
  Omit<
    React.ComponentPropsWithRef<ComponentType>,
    'as' | keyof ComponentProps
  > & {
    as?: ComponentType;
  };

export type PropsFromAs<
  ComponentType extends As,
  ComponentProps
> = (PropsWithAs<ComponentType, ComponentProps> & { as: ComponentType }) &
  PropsWithAs<ComponentType, ComponentProps>;

export type ComponentWithForwardedRef<
  ElementType extends React.ElementType,
  ComponentProps
> = React.ForwardRefExoticComponent<
  ComponentProps &
    React.HTMLProps<React.ElementType<ElementType>> &
    React.ComponentPropsWithRef<ElementType>
>;

export interface ComponentWithAs<ComponentType extends As, ComponentProps> {
  // These types are a bit of a hack, but cover us in cases where the `as` prop
  // is not a JSX string type. Makes the compiler happy so 🤷‍♂️
  <TT extends As>(
    props: PropsWithAs<TT, ComponentProps>
  ): React.ReactElement | null;
  (
    props: PropsWithAs<ComponentType, ComponentProps>
  ): React.ReactElement | null;

  displayName?: string;
  propTypes?: React.WeakValidationMap<
    PropsWithAs<ComponentType, ComponentProps>
  >;
  contextTypes?: React.ValidationMap<any>;
  defaultProps?: Partial<PropsWithAs<ComponentType, ComponentProps>>;
}

/**
 * This is a hack for sure. The thing is, getting a component to intelligently
 * infer props based on a component or JSX string passed into an `as` prop is
 * kind of a huge pain. Getting it to work and satisfy the constraints of
 * `forwardRef` seems dang near impossible. To avoid needing to do this awkward
 * type song-and-dance every time we want to forward a ref into a component
 * that accepts an `as` prop, we abstract all of that mess to this function for
 * the time time being.
 *
 * TODO: Eventually we should probably just try to get the type defs above
 * working across the board, but ain't nobody got time for that mess!
 *
 * @param Comp
 */
export function forwardRefWithAs<Props, ComponentType extends As>(
  comp: (
    props: PropsFromAs<ComponentType, Props>,
    ref: React.RefObject<any>
  ) => React.ReactElement | null
) {
  return (React.forwardRef(comp as any) as unknown) as ComponentWithAs<
    ComponentType,
    Props
  >;
}

/*
Test components to make sure our dynamic As prop components work as intended 
type PopupProps = {
  lol: string;
  children?: React.ReactNode | ((value?: number) => JSX.Element);
};
export const Popup = forwardRefWithAs<PopupProps, 'input'>(
  ({ as: Comp = 'input', lol, className, children, ...props }, ref) => {
    return (
      <Comp ref={ref} {...props}>
        {typeof children === 'function' ? children(56) : children}
      </Comp>
    );
  }
);
export const TryMe1: React.FC = () => {
  return <Popup as="input" lol="lol" name="me" />;
};
export const TryMe2: React.FC = () => {
  let ref = React.useRef(null);
  return <Popup ref={ref} as="div" lol="lol" />;
};

export const TryMe4: React.FC = () => {
  return <Popup as={Whoa} lol="lol" test="123" name="boop" />;
};
export const Whoa: React.FC<{
  help?: boolean;
  lol: string;
  name: string;
  test: string;
}> = props => {
  return <input {...props} />;
};
*/
// export const TryMe3: React.FC = () => {
//   return <Popup as={Cool} lol="lol" name="me" test="123" />;
// };
// let Cool = styled(Whoa)`
//   padding: 10px;
// `
