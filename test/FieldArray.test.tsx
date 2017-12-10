import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FieldArray, ArrayHelpers } from '../src/FieldArray';
import { Formik } from '../src/formik';
import { isFunction } from '../src/utils';
import { mount } from 'enzyme';

// tslint:disable-next-line:no-empty
const noop = () => {};

const TestForm: React.SFC<any> = p => (
  <Formik
    onSubmit={noop}
    initialValues={{ friends: ['jared', 'andrea', 'brent'] }}
    {...p}
  />
);

const Target: React.SFC<ArrayHelpers> = () => null;

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
    it('can add an object to a field array', () => {
      const tree = mount(
        <TestForm
          render={() => (
            <FieldArray
              name="friends"
              render={arrayProps => <Target {...arrayProps} />}
            />
          )}
        />
      );

      tree
        .find(Target)
        .props()
        .push('jane');

      expect(tree.find(Target).props().form.values.friends[3]).toEqual('jane');
    });
  });

  describe('props.pop()', () => {
    it('should remove the last value from the field array', () => {
      const tree = mount(
        <TestForm
          render={() => (
            <FieldArray
              name="friends"
              render={arrayProps => <Target {...arrayProps} />}
            />
          )}
        />
      );

      const friend = tree
        .find(Target)
        .props()
        .pop();

      expect(tree.find(Target).props().form.values.friends.length).toEqual(2);
      expect(friend).toEqual('brent');
    });
  });

  describe('props.pop()', () => {
    it('should remove the last value from the field array', () => {
      const tree = mount(
        <TestForm
          render={() => (
            <FieldArray
              name="friends"
              render={arrayProps => <Target {...arrayProps} />}
            />
          )}
        />
      );

      const friend = tree
        .find(Target)
        .props()
        .pop();

      expect(tree.find(Target).props().form.values.friends.length).toEqual(2);
      expect(friend).toEqual('brent');
    });
  });
});
