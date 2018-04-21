/* @flow */
import * as React from 'react';
import { Form, Formik } from '../dist/formik';
import Mutation from './controls/Mutation';
import Input from './controls/Input';
import NumberInput from './controls/NumberInput';
import bind from './bind';
import someApiMutation from './mutations/someApiMutation';

type Props = {
  data: {|
    +id: string,
    +name: string,
    +age: number,
    +deep: {|
      +id: number,
      +value: string,
    |},
    +arr: Array<{| +title: string |}>,
  |},
  parentId: string,
};

// We must declare initialValues type
const mapData = (data): $ElementType<Props, 'data'> => ({
  ...data,
});

class BasicForm extends React.Component<Props> {
  render() {
    const { data, parentId } = this.props;

    return (
      <Form>
        <Mutation mutation={someApiMutation}>
          {({ onSubmit, error: apiError }) => (
            <Formik
              initialValues={mapData(data)}
              validate={values => {
                if (values.age < 10) {
                  return { age: 'Too young' };
                }

                if (values.age > 20) {
                  return { age: 'Too old' };
                }

                /* $ExpectError "Cannot create `Formik` element
                because property `unknown` is missing in object type [1]
                in the indexer property's key of the return value
                of property `validate`."*/
                return { unknown: 'xxx' };
              }}
              onSubmit={(values, formikActions) => {
                // non converted values are passed to make errors
                // can be shown in this form (api error keys can be different)
                onSubmit({ ...values, parentId }, values, formikActions);

                /* $ExpectError Cannot call `onSubmit` with object literal bound to `input`
                because property `parentId` is missing in object literal [1] but exists in object type [2].
                */
                onSubmit(values, values, formikActions);

                onSubmit(
                  /* $ExpectError Cannot call `onSubmit`
                  with object literal bound to `input`
                  because property `hello` is missing in object type [1]
                  but exists in object literal [2].*/
                  { ...values, parentId, hello: 'world' },
                  values,
                  formikActions
                );
              }}
            >
              {formProps => {
                const {
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleReset,
                  setErrors,
                  setTouched,
                  dirty,
                  isSubmitting,
                  isValid,
                } = formProps;

                return (
                  <React.Fragment>
                    {apiError != null && <div>{apiError}</div>}

                    <Input {...bind(formProps, 'name')} />

                    <NumberInput {...bind(formProps, 'age')} />

                    {/* $ExpectError Cannot create `Input` element because number
                    [1] is incompatible with string [2] in property `value`. */}
                    <Input {...bind(formProps, 'age')} />

                    {/* Trying to bind to unknown property will cause a lot of errors so ExpectError will not help,
                    uncomment to see effect */}
                    {/* <Input {...bind(formProps, 'unknown')} /> */}

                    <Input
                      name={'name'}
                      value={values.name}
                      onChange={handleChange}
                      // error={Boolean(touched.name === true && errors.name)}
                    />

                    <Input
                      name={'age'}
                      /* $ExpectError Cannot create `Input`
                      element because number [1] is incompatible with string [2] in property `value`
                      */
                      value={values.age}
                      onChange={handleChange}
                    />

                    <Input
                      name={'unknown'}
                      /*
                      $ExpectError Cannot get `values.unknown` because property `unknown` is missing in object type [1].
                      */
                      value={values.unknown}
                      onChange={handleChange}
                    />

                    <div>
                      {/* Show errors, and deep errors */}
                      {errors.name}
                      {errors.deep && errors.deep.value}
                      {errors.arr && errors.arr[0] && errors.arr[0].title};
                    </div>

                    <div>
                      {/* Check touched */}
                      {touched.name && 'name is touched'}
                      {touched.deep &&
                        touched.deep.value &&
                        'deep.value is touched'}
                      {touched.arr &&
                        touched.arr[0] &&
                        touched.arr[0].title &&
                        'arr 0 titlw is touched'};
                    </div>

                    <button
                      onClick={() => {
                        setErrors({ name: '2fff' });
                        // Not sure this is needed to set error on whole subobject
                        // setErrors({ deep: 'error' });
                        setErrors({ deep: { value: 'error' } });

                        // setErrors({ arr: 'error' });
                        setErrors({
                          arr: [{ title: 'error' }, { title: 'error2' }],
                        });

                        /* $ExpectError 'Cannot call `setErrors`
                        with object literal bound to `errors`
                        because property `unknown` is missing
                        in object literal [1] but exists in `FormikErrors`"*/
                        setErrors({ unknown: 'eeee' });

                        /* $ExpectError Cannot call `setErrors`
                        with object literal bound to `errors` because property
                        `unknownValue` is missing in object literal [1]
                        but exists in `FormikErrors` [2] in property `deep`.
                        */
                        setErrors({ deep: { unknownValue: 'error' } });

                        /*
                        $ExpectError Cannot call `setErrors` with object literal
                        bound to `errors` because property `unknown` is missing
                        in object literal [1] but exists in `FormikErrors` [2] in array element of property `arr`.
                        */
                        setErrors({
                          arr: [{ unknown: 'error' }],
                        });
                      }}
                    />

                    <button
                      onClick={() => {
                        setTouched({ name: true });
                        // Not sure this is needed to set error on whole subobject
                        // setTouched({ deep: 'error' });
                        setTouched({ deep: { value: true } });

                        // setTouched({ arr: 'error' });
                        setTouched({
                          arr: [{ title: false }, { title: true }],
                        });

                        /* $ExpectError Cannot call `setTouched` with
                        object literal bound to `touched` because
                        property `unknown` is missing in object literal
                        [1] but exists in `FormikTouched` [2]*/
                        setTouched({ unknown: true });

                        /* $ExpectError Cannot call `setTouched` with object literal
                        bound to `touched` because property `unknownValue` is missing
                        in object literal [1] but exists in `FormikTouched` [2] in property `deep`.
                        */
                        setTouched({ deep: { unknownValue: 'error' } });

                        /*
                        $ExpectError Cannot call `setTouched` with object
                        literal bound to `touched` because property `unknown`
                        is missing in object literal [1] but exists in
                        `FormikTouched` [2] in array element of property `arr`
                        */
                        setTouched({
                          arr: [{ unknown: 'error' }],
                        });
                      }}
                    />

                    <button
                      onClick={handleReset}
                      disabled={!dirty || isSubmitting}
                    >
                      {'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={!dirty || isSubmitting || !isValid}
                    >
                      {'Save'}
                    </button>
                  </React.Fragment>
                );
              }}
            </Formik>
          )}
        </Mutation>
      </Form>
    );
  }
}
