import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FieldArray } from '../src/FieldArray';
import { Formik } from '../src/formik';
import { isFunction } from '../src/utils';

// tslint:disable-next-line:no-empty
const noop = () => {};

const friends = ['jared', 'andrea', 'brent'];
const TestForm: React.SFC<any> = p => (
  <Formik onSubmit={noop} initialValues={{ friends }} {...p} />
);

describe('<FieldArray />', () => {
  const node = document.createElement('div');

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(node);
  });

  it('it passes down array helpers as props', () => {
    ReactDOM.render(
      <TestForm
        render={() => (
          <FieldArray
            name="friends"
            render={arrayProps => {
              expect(isFunction(arrayProps.push)).toBeTruthy();
              return null;
            }}
          />
        )}
      />,
      node
    );
  });

  describe('props.push()', () => {
    it('should add a value to the end of the field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      ReactDOM.render(
        <TestForm
          render={(props: any) => {
            formikBag = props;
            return (
              <FieldArray
                name="friends"
                render={arrayProps => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        />,
        node
      );

      arrayHelpers.push('jared');
      expect(formikBag.values.friends).toEqual(friends.concat('jared'));
      expect(formikBag.values.friends.length).toEqual(friends.length + 1);
    });
  });

  describe('props.pop()', () => {
    it('should remove and return the last value from the field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      ReactDOM.render(
        <TestForm
          render={(props: any) => {
            formikBag = props;
            return (
              <FieldArray
                name="friends"
                render={arrayProps => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        />,
        node
      );

      const el = arrayHelpers.pop();
      expect(formikBag.values.friends).toEqual(['jared', 'andrea']);
      expect(el).toEqual('brent');
    });
  });
});
