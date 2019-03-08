import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Formik, FormikProps, ErrorMessage } from '../src';
import { noop } from './testHelpers';
import { act } from 'react-dom/test-utils';
interface TestFormValues {
  name: string;
  email: string;
}

const TestForm: React.SFC<any> = p => (
  <Formik
    onSubmit={noop}
    initialValues={{ name: 'jared', email: 'hello@reason.nyc' }}
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

    function applyAct(obj: any) {
      let handler = {
        get(target: any, propKey: any, _receiver: any) {
          const origMethod = target[propKey];
          return function(...args: any): any {
            let self = this;
            return act(() => {
              let result = origMethod.apply(self, args);
              console.log(
                propKey + JSON.stringify(args) + ' -> ' + JSON.stringify(result)
              );
              return result;
            });
          };
        },
      };
      return new Proxy(obj, handler);
    }

    act(() => {
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
    });

    const real = applyAct(actualFProps);
    real.setFieldError('email', message);

    expect(actual).toEqual(undefined);

    // Only renders if Field has been visited.
    real.setFieldTouched('email');

    // Renders after being visited with an error.
    expect(actual).toEqual(message);

    // real.submitForm();

    // expect(actualFProps.submitCount).toEqual(1);
  });
});
