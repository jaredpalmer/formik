import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
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

  const consoleError = console.error;

  let consoleErrorLog: any[] = [];

  beforeEach(() => {
    consoleErrorLog = [];
    // Make sure we aren't triggering React console.error calls
    console.error = (...args: any[]) => {
      // NOTE: We can't throw in here directly as most console.error calls happen
      // inside promises and result in an unhandled promise rejection
      consoleErrorLog.push(`console.error called with args: ${args}`);
      consoleError.apply(console, args as any);
    };
  });

  afterEach(() => {
    if (consoleErrorLog.length > 0) {
      // Not using an Error object here because the stacktrace is misleading
      throw consoleErrorLog[0];
    }

    console.error = consoleError;
  });

  it('renders component with array helpers as props', () => {
    const TestComponent = (arrayProps: any) => {
      expect(isFunction(arrayProps.push)).toBeTruthy();
      return null;
    };

    act(() => {
      ReactDOM.render(
        <TestForm
          component={() => (
            <FieldArray name="friends" component={TestComponent} />
          )}
        />,
        node
      );
    });
  });

  it('renders with render callback with array helpers as props', () => {
    act(() => {
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
  });

  it('renders with "children as a function" with array helpers as props', () => {
    act(() => {
      ReactDOM.render(
        <TestForm
          render={() => (
            <FieldArray name="friends">
              {arrayProps => {
                expect(isFunction(arrayProps.push)).toBeTruthy();
                return null;
              }}
            </FieldArray>
          )}
        />,
        node
      );
    });
  });

  it('renders with name as props', () => {
    act(() => {
      ReactDOM.render(
        <TestForm
          render={() => (
            <FieldArray
              name="friends"
              render={arrayProps => {
                expect(arrayProps.name).toBe('friends');
                return null;
              }}
            />
          )}
        />,
        node
      );
    });
  });

  describe('props.push()', () => {
    it('should add a value to the end of the field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      act(() => {
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
      });
      act(() => {
        arrayHelpers.push('jared');
      });
      act(() => {
        arrayHelpers.push('andrea');
      });
      const expected = ['jared', 'andrea', 'brent', 'jared', 'andrea'];
      expect(formikBag.values.friends).toEqual(expected);
    });

    it('should push clone not actual referance', () => {
      let personTemplate = { firstName: '', lastName: '' };
      let formikBag: any;
      let arrayHelpers: any;
      act(() => {
        ReactDOM.render(
          <TestForm
            initialValues={{ people: [] }}
            render={(props: any) => {
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
          />,
          node
        );
      });
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
      act(() => {
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
      });

      let el;
      act(() => {
        el = arrayHelpers.pop();
      });
      const expected = ['jared', 'andrea'];
      expect(formikBag.values.friends).toEqual(expected);
      expect(el).toEqual('brent');
    });
  });

  describe('props.swap()', () => {
    it('should swap two values in field array', () => {
      let formikBag: any;
      let arrayHelpers: any;
      act(() => {
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
      });
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
      act(() => {
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
      });
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
      act(() => {
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
      });
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
      act(() => {
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
      });

      let el;
      act(() => {
        el = arrayHelpers.unshift('brian');
      });
      const expected = ['brian', 'jared', 'andrea', 'brent'];
      expect(formikBag.values.friends).toEqual(expected);
      expect(el).toEqual(4);
    });
  });

  describe('props.remove()', () => {
    it('should remove a value at given index of field array', () => {
      let formikBag: any;
      let arrayHelpers: any;

      // Object.defineProperty(arrayHelpers, 'remove', {
      //   get() {
      //     act(() => {

      //     })
      //   }
      // })
      // const aProxy = new Proxy(arrayHelpers.remove, {
      //   // get: function(obj: any, prop: any) {
      //   //   // // An extra property
      //   //   // if (prop === 'latestBrowser') {
      //   //   //   return obj.browsers[obj.browsers.length - 1];
      //   //   // }

      //   //   // The default behavior to return the value
      //   //   return () =>
      //   //     act(() => {
      //   //       obj[prop]();
      //   //     });
      //   // },
      //   apply: function(target, that, args) {
      //     sup.apply(that, args);
      //     base.apply(that, args);
      //   },
      // });
      act(() => {
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
      });

      aProxy.remove(1);

      const expected = ['jared', 'brent'];
      expect(formikBag.values.friends).toEqual(expected);
    });
  });
});
