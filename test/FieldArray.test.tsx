import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { FieldArray, Formik, isFunction } from '../src';

// tslint:disable-next-line:no-empty
const noop = () => {};

const TestForm: React.SFC<any> = p => (
  <Formik
    onSubmit={noop}
    initialValues={{ friends: ['jared', 'andrea', 'brent'] }}
    {...p}
  />
);

describe('<FieldArray />', () => {
  const node = document.createElement('div');

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(node);
  });

  it('renders component with array helpers as props', () => {
    const TestComponent = (arrayProps: any) => {
      expect(isFunction(arrayProps.push)).toBeTruthy();
      return null;
    };

    ReactDOM.render(
      <TestForm
        component={() => (
          <FieldArray name="friends" component={TestComponent} />
        )}
      />,
      node
    );
  });

  it('renders with render callback with array helpers as props', () => {
    ReactDOM.render(
      <TestForm>
        {() => (
          <FieldArray
            name="friends"
            render={arrayProps => {
              expect(isFunction(arrayProps.push)).toBeTruthy();
              return null;
            }}
          />
        )}
      </TestForm>,
      node
    );
  });

  it('renders with "children as a function" with array helpers as props', () => {
    ReactDOM.render(
      <TestForm>
        {() => (
          <FieldArray name="friends">
            {arrayProps => {
              expect(isFunction(arrayProps.push)).toBeTruthy();
              return null;
            }}
          </FieldArray>
        )}
      </TestForm>,
      node
    );
  });

  it('renders with name as props', () => {
    ReactDOM.render(
      <TestForm>
        {() => (
          <FieldArray
            name="friends"
            render={arrayProps => {
              expect(arrayProps.name).toBe('friends');
              return null;
            }}
          />
        )}
      </TestForm>,
      node
    );
  });

  describe('props.push()', () => {
    it('should add a value to the end of the field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      ReactDOM.render(
        <TestForm>
          {(props: any) => {
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
        </TestForm>,
        node
      );

      arrayHelpers.push('jared');
      const expected = ['jared', 'andrea', 'brent', 'jared'];
      expect(formikBag.values.friends).toEqual(expected);
    });

    it('should add multiple values to the end of the field array', () => {
      let formikBag: any;
      let addFriendsFn: any;
      const AddFriendsButton = (arrayProps: any) => {
        const addFriends = () => {
          arrayProps.push('john');
          arrayProps.push('paul');
          arrayProps.push('george');
          arrayProps.push('ringo');
        };

        addFriendsFn = addFriends;

        return <button type="button" onClick={addFriends} />;
      };

      ReactDOM.render(
        <TestForm>
          {(props: any) => {
            formikBag = props;
            return <FieldArray name="friends" render={AddFriendsButton} />;
          }}
        </TestForm>,
        node
      );

      addFriendsFn();
      const expected = [
        'jared',
        'andrea',
        'brent',
        'john',
        'paul',
        'george',
        'ringo',
      ];
      expect(formikBag.values.friends).toEqual(expected);
    });

    it('should push clone not actual referance', () => {
      let personTemplate = { firstName: '', lastName: '' };
      let formikBag: any;
      let arrayHelpers: any;
      ReactDOM.render(
        <TestForm initialValues={{ people: [] }}>
          {(props: any) => {
            formikBag = props;
            return (
              <FieldArray
                name="people"
                render={arrayProps => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              />
            );
          }}
        </TestForm>,
        node
      );

      arrayHelpers.push(personTemplate);
      expect(
        formikBag.values.people[formikBag.values.people.length - 1]
      ).not.toBe(personTemplate);
      expect(
        formikBag.values.people[formikBag.values.people.length - 1]
      ).toMatchObject(personTemplate);
    });
  });

  describe('props.pop()', () => {
    it('should remove and return the last value from the field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      ReactDOM.render(
        <TestForm>
          {(props: any) => {
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
        </TestForm>,
        node
      );

      const el = arrayHelpers.pop();
      const expected = ['jared', 'andrea'];
      expect(formikBag.values.friends).toEqual(expected);
      expect(el).toEqual('brent');
    });
  });

  describe('props.swap()', () => {
    it('should swap two values in field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      ReactDOM.render(
        <TestForm>
          {(props: any) => {
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
        </TestForm>,
        node
      );

      arrayHelpers.swap(0, 2);
      const expected = ['brent', 'andrea', 'jared'];
      expect(formikBag.values.friends).toEqual(expected);
    });
  });

  describe('props.insert()', () => {
    it('should insert a value at given index of field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      ReactDOM.render(
        <TestForm>
          {(props: any) => {
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
        </TestForm>,
        node
      );

      arrayHelpers.insert(1, 'brian');
      const expected = ['jared', 'brian', 'andrea', 'brent'];
      expect(formikBag.values.friends).toEqual(expected);
    });
  });

  describe('props.replace()', () => {
    it('should replace a value at given index of field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      ReactDOM.render(
        <TestForm>
          {(props: any) => {
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
        </TestForm>,
        node
      );

      arrayHelpers.replace(1, 'brian');
      const expected = ['jared', 'brian', 'brent'];
      expect(formikBag.values.friends).toEqual(expected);
    });
  });

  describe('props.unshift()', () => {
    it('should add a value to start of field array and return its length', () => {
      let formikBag: any;
      let arrayHelpers: any;
      ReactDOM.render(
        <TestForm>
          {(props: any) => {
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
        </TestForm>,
        node
      );

      const el = arrayHelpers.unshift('brian');
      const expected = ['brian', 'jared', 'andrea', 'brent'];
      expect(formikBag.values.friends).toEqual(expected);
      expect(el).toEqual(4);
    });
  });

  describe('props.remove()', () => {
    it('should remove a value at given index of field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      ReactDOM.render(
        <TestForm>
          {(props: any) => {
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
        </TestForm>,
        node
      );

      arrayHelpers.remove(1);
      const expected = ['jared', 'brent'];
      expect(formikBag.values.friends).toEqual(expected);
    });
  });

  describe('given array-like object representing errors', () => {
    it('should run arrayHelpers successfully', () => {
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

      formikBag.setErrors({ friends: { 2: ['Field error'] } });

      arrayHelpers.push('michael');
      const el = arrayHelpers.pop();
      arrayHelpers.swap(0, 2);
      arrayHelpers.insert(1, 'michael');
      arrayHelpers.replace(1, 'brian');
      arrayHelpers.unshift('michael');
      arrayHelpers.remove(1);

      const expected = ['michael', 'brian', 'andrea', 'jared'];
      expect(el).toEqual('michael');
      expect(formikBag.values.friends).toEqual(expected);
    });
  });
});
