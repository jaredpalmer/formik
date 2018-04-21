/* @flow */

type ApiError = {|
  +key: string,
  +message: string,
|};

// Api can have different interface not same as formik submit
export default (
  {
    id,
    name,
    age,
    deep,
    arr,
    parentId,
  }: $ReadOnly<{|
    id: string,
    name: string,
    age: number,
    deep: {|
      +id: number,
      +value: string,
    |},
    arr: Array<{| +title: string |}>,
    parentId: string,
  |}>,
  callback: (errs: ?Array<ApiError>) => void
) => {
  // commitMutation, call callback on errors
};
