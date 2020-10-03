import * as React from 'react';
import { act, render } from '@testing-library/react';
import { Formik, FormikProps, ErrorMessage } from '../src';
import { noop } from './testHelpers';

interface TestFormValues {
  name: string;
  email: string;
}

const TestForm: React.FC<any> = p => (
  <Formik
    onSubmit={noop}
    initialValues={{ name: 'jared', email: 'hello@reason.nyc' }}
    {...p}
  />
);

fdescribe('<ErrorMessage />', () => {
  it('renders with children as a function', async () => {
    let actual: any; /** ErrorMessage ;) */
    let actualFProps: any;
    let message = 'Wrong';
    render(
      <TestForm
        render={(fProps: FormikProps<TestFormValues>) => {
          actualFProps = fProps;
          return (
            <div>
              <ErrorMessage name="email">
                {props => (actual = props) || <div>{props}</div>}
              </ErrorMessage>
            </div>
          );
        }}
      />
    );

    await act(async () => {
      await actualFProps.setFieldError('email', message);
    });

    // Only renders if Field has been visited.
    expect(actual).toEqual(undefined);

    await act(async () => {
      await actualFProps.setFieldTouched('email');
    });

    // Renders after being visited with an error.
    expect(actual).toEqual(message);
  });
});
