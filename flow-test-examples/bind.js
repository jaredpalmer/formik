/* @flow */
import type { ChildrenProps } from '../dist/formik';

export default function bind<
  Values: {},
  N: $Keys<Values>,
  Props: ChildrenProps<Values>
>(
  props: Props,
  name: N
): { value: $ElementType<$ElementType<Props, 'values'>, N> } {
  const values: Values = props.values;

  return {
    value: values[name] || null,
    onChange: props.handleChange(name),
    onBlur: props.handleBlur(name),
    error: Boolean(props.touched[name] === true && props.errors[name]),
    helperText:
      props.touched[name] === true
        ? props.errors[name] && props.errors[name].toString()
        : '',
  };
}
