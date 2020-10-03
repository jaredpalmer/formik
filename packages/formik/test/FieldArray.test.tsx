import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { FieldArray, Formik, isFunction } from '../src';

const noop = () => {};

const TestForm: React.FC<any> = p => (
  <Formik
    onSubmit={noop}
    initialValues={{ friends: ['jared', 'andrea', 'brent'] }}
    {...p}
  />
);

describe('<FieldArray />', () => {
  it('renders component with array helpers as props', () => {
    const TestComponent = (arrayProps: any) => {
      expect(isFunction(arrayProps.push)).toBeTruthy();
      return null;
    };

    render(
      <TestForm
        component={() => (
          <FieldArray name="friends" component={TestComponent} />
        )}
      />
    );
  });

  it('renders with render callback with array helpers as props', () => {
    render(
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
      </TestForm>
    );
  });

  it('renders with "children as a function" with array helpers as props', () => {
    render(
      <TestForm>
        {() => (
          <FieldArray name="friends">
            {arrayProps => {
              expect(isFunction(arrayProps.push)).toBeTruthy();
              return null;
            }}
          </FieldArray>
        )}
      </TestForm>
    );
  });

  it('renders with name as props', () => {
    render(
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
      </TestForm>
    );
  });

  describe('props.push()', () => {
    it('should add a value to the end of the field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      render(
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
        </TestForm>
      );

      act(() => {
        arrayHelpers.push('jared');
      });

      const expected = ['jared', 'andrea', 'brent', 'jared'];
      expect(formikBag.values.friends).toEqual(expected);
    });

    it('should add multiple values to the end of the field array', () => {
      let formikBag: any;
      const AddFriendsButton = (arrayProps: any) => {
        const addFriends = () => {
          arrayProps.push('john');
          arrayProps.push('paul');
          arrayProps.push('george');
          arrayProps.push('ringo');
        };

        return (
          <button
            data-testid="add-friends-button"
            type="button"
            onClick={addFriends}
          />
        );
      };

      render(
        <TestForm>
          {(props: any) => {
            formikBag = props;
            return <FieldArray name="friends" render={AddFriendsButton} />;
          }}
        </TestForm>
      );

      act(() => {
        const btn = screen.getByTestId('add-friends-button');
        fireEvent.click(btn);
      });

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

    it('should push clone not actual reference', () => {
      let personTemplate = { firstName: '', lastName: '' };
      let formikBag: any;
      let arrayHelpers: any;
      render(
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
        </TestForm>
      );

      act(() => {
        arrayHelpers.push(personTemplate);
      });
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
      render(
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
        </TestForm>
      );

      act(() => {
        const el = arrayHelpers.pop();
        expect(el).toEqual('brent');
      });
      const expected = ['jared', 'andrea'];
      expect(formikBag.values.friends).toEqual(expected);
    });
  });

  describe('props.swap()', () => {
    it('should swap two values in field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      render(
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
        </TestForm>
      );

      act(() => {
        arrayHelpers.swap(0, 2);
      });
      const expected = ['brent', 'andrea', 'jared'];
      expect(formikBag.values.friends).toEqual(expected);
    });
  });

  describe('props.insert()', () => {
    it('should insert a value at given index of field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      render(
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
        </TestForm>
      );

      act(() => {
        arrayHelpers.insert(1, 'brian');
      });
      const expected = ['jared', 'brian', 'andrea', 'brent'];
      expect(formikBag.values.friends).toEqual(expected);
    });
  });

  describe('props.replace()', () => {
    it('should replace a value at given index of field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      render(
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
        </TestForm>
      );

      act(() => {
        arrayHelpers.replace(1, 'brian');
      });
      const expected = ['jared', 'brian', 'brent'];
      expect(formikBag.values.friends).toEqual(expected);
    });
  });

  describe('props.unshift()', () => {
    it('should add a value to start of field array and return its length', () => {
      let formikBag: any;
      let arrayHelpers: any;
      render(
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
        </TestForm>
      );

      let el: any;
      act(() => {
        el = arrayHelpers.unshift('brian');
      });
      const expected = ['brian', 'jared', 'andrea', 'brent'];
      expect(formikBag.values.friends).toEqual(expected);
      expect(el).toEqual(4);
    });
  });

  describe('props.remove()', () => {
    let formikBag: any;
    let arrayHelpers: any;

    beforeEach(() => {
      render(
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
        </TestForm>
      );
    });
    it('should remove a value at given index of field array', () => {
      act(() => {
        arrayHelpers.remove(1);
      });
      const expected = ['jared', 'brent'];
      expect(formikBag.values.friends).toEqual(expected);
    });

    it('should be an empty array when removing all values', () => {
      act(() => {
        arrayHelpers.remove(0);
        arrayHelpers.remove(0);
        arrayHelpers.remove(0);
      });
      const expected: any[] = [];

      expect(formikBag.values.friends).toEqual(expected);
    });
    it('should clean field from errors and touched', () => {
      act(() => {
        // seems weird calling 0 multiple times, but every time we call remove, the indexes get updated.
        arrayHelpers.remove(0);
        arrayHelpers.remove(0);
        arrayHelpers.remove(0);
      });

      expect(formikBag.errors.friends).toEqual(undefined);
      expect(formikBag.touched.friends).toEqual(undefined);
    });
  });

  describe('given array-like object representing errors', () => {
    it('should run arrayHelpers successfully', async () => {
      let formikBag: any;
      let arrayHelpers: any;
      render(
        <TestForm>
          {(props: any) => {
            formikBag = props;
            return (
              <FieldArray name="friends">
                {arrayProps => {
                  arrayHelpers = arrayProps;
                  return null;
                }}
              </FieldArray>
            );
          }}
        </TestForm>
      );

      act(() => {
        formikBag.setErrors({ friends: { 2: ['Field error'] } });
      });

      let el: any;
      await act(async () => {
        await arrayHelpers.push('michael');
        el = arrayHelpers.pop();
        arrayHelpers.swap(0, 2);
        arrayHelpers.insert(1, 'michael');
        arrayHelpers.replace(1, 'brian');
        arrayHelpers.unshift('michael');
        arrayHelpers.remove(1);
      });

      expect(el).toEqual('michael');
      const finalExpected = ['michael', 'brian', 'andrea', 'jared'];
      expect(formikBag.values.friends).toEqual(finalExpected);
    });
  });
});
