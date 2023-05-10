import * as React from 'react';
import { forwardRefWithAs } from './forwardRefWithAs';
import cx from 'classnames';
import { useButton } from 'react-aria';
export interface TWButtonProps {
  /**
   * Intent of the button
   * @default none
   */
  intent?: 'none' | 'primary' | 'warning' | 'danger' | 'success';
  /**
   * Color of the button
   */
  color?: 'blue' | 'green' | 'red';
  /**
   * Button size
   * @default md
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Minimal appearance?
   */
  minimal?: boolean;
  /**
   * Left icon
   */
  icon?: React.ReactElement;
  /** Right icon */
  iconRight?: React.ReactElement;
  /** Click handler */
  onClick?: () => void;
}

const mapIntentToColor = {
  primary: 'blue',
  success: 'green',
  danger: 'red',
  warning: 'yellow',
};

export const TWButton = forwardRefWithAs<TWButtonProps, 'button'>(
  (
    {
      as: is = 'button',
      color,
      intent = 'none',
      size = 'md',
      className,
      icon,
      minimal,

      iconRight,
      ...props
    },
    ref
  ) => {
    const { children } = props;
    const tailwindColor = mapIntentToColor[intent] ?? color;
    const iconIsOnlyChild: boolean = !!(
      (icon && !iconRight && !children) ||
      (iconRight && !icon && !children)
    );
    let sizeClasses;
    let iconClasses;
    if (size === 'xs') {
      sizeClasses = 'text-xs rounded-md leading-4';
      sizeClasses += iconIsOnlyChild ? ' p-1.5' : ' py-1.5 px-2.5';
      iconClasses = 'h-3 w-3';
    }
    if (size === 'sm') {
      sizeClasses = 'text-sm rounded-md leading-4';
      sizeClasses += iconIsOnlyChild ? ' p-2' : ' py-2 px-3';
      iconClasses = 'h-3 w-3';
    }
    if (size === 'md') {
      sizeClasses = 'text-sm rounded-md leading-5';
      sizeClasses += iconIsOnlyChild ? ' p-2' : ' py-2 px-4';
      iconClasses = 'h-5 w-5';
    }
    if (size === 'lg') {
      sizeClasses = 'text-base rounded-md leading-6';
      sizeClasses += iconIsOnlyChild ? ' p-2' : ' py-2 px-4';
      iconClasses = 'h-6 w-6';
    }
    if (size === 'xl') {
      sizeClasses = 'text-base rounded-md leading-6';
      sizeClasses += iconIsOnlyChild ? ' p-3' : ' py-3 px-6';
      iconClasses = 'h-6 w-6';
    }

    const leftIcon = icon
      ? React.cloneElement(icon, {
          ...icon.props,
          height: '1em',
          width: '1em',
          className: cx(
            'block',
            {
              'text-white': !!tailwindColor && !minimal,
              [`text-${tailwindColor}-700`]: !!tailwindColor && !!minimal,
              'text-gray-600': !tailwindColor,
              '-ml-1 mr-2': !iconIsOnlyChild,
            },
            iconClasses,
            icon?.props.className
          ),
        })
      : null;
    const rightIcon = iconRight
      ? React.cloneElement(iconRight, {
          ...iconRight.props,
          height: '1em',
          width: '1em',
          className: cx(
            'block ',
            {
              'text-white': !!tailwindColor && !minimal,
              [`text-${tailwindColor}-700`]: !!tailwindColor && !!minimal,
              'text-gray-600': !tailwindColor,
              '-mr-1 ml-2': !iconIsOnlyChild,
            },
            iconClasses,
            iconRight?.props.className
          ),
        })
      : null;

    const propsToPass = {
      ...props,
      className: cx(
        'font-medium inline-flex items-center  focus:outline-none transition duration-150 ease-in-out',
        {
          [`ring-1 ring-black ring-opacity-5  border border-transparent text-white bg-${tailwindColor}-600 hover:bg-${tailwindColor}-500 focus:border-${tailwindColor}-700 focus:ring focus:ring-${tailwindColor} active:border-${tailwindColor}-700`]:
            !!tailwindColor && !minimal,
          [`ring-1 ring-black ring-opacity-5 border border-gray-300 text-gray-700 bg-white hover:text-gray-500  focus:ring focus:ring-blue focus:border-blue-300 active:text-gray-800 active:bg-gray-50`]:
            !tailwindColor && !minimal,
          [`hover:bg-${tailwindColor}-100 active:bg-${tailwindColor}-200 text-${tailwindColor}-700 focus:ring focus:ring-${tailwindColor} border-transparent`]:
            minimal && tailwindColor,
          [`hover:bg-gray-200 active:bg-gray-300 text-gray-900 focus:ring focus:ring-blue border-transparent`]:
            minimal && !tailwindColor,
        },
        sizeClasses,
        className
      ),
      children: (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      ),
    };

    let { buttonProps } = useButton(
      {
        ...props,
        elementType: is,
      } as any,
      ref
    );

    return React.createElement(is, {
      ...propsToPass,
      ...buttonProps,
      ref,
      className: propsToPass.className,
    });
  }
);

TWButton.displayName = 'TWButton';
