import { FormikConfig, FormikProps } from '@formik/core';
import { TestFormValues, testProps } from '@formik/core/test/constants';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Formik, ErrorMessage } from '../src';

const TestForm: React.FC<Partial<FormikConfig<TestFormValues>>> = p => (
  <Formik
    {...testProps}
    {...p}
  />
);

describe('<ErrorMessage />', () => {
  const node = document.createElement('div');
  afterEach(() => {
    ReactDOM.unmountComponentAtNode(node);
  });
  it('renders with children as a function', async () => {
    let actual: any; /** ErrorMessage ;) */
    let actualFProps: any;
    let message = 'Wrong';
    ReactDOM.render(
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
      />,
      node
    );

    actualFProps.setFieldError('email', message);
    // Only renders if Field has been visited.
    expect(actual).toEqual(undefined);
    actualFProps.setFieldTouched('email');
    // Renders after being visited with an error.
    expect(actual).toEqual(message);
  });
});
