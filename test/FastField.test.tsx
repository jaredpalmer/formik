import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { FastField as Field, FieldProps, Formik, FormikProps } from '../src';

import { shallow, mount } from 'enzyme';
import { noop } from './testHelpers';

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

describe('A <Field />', () => {
  describe('<Field validate>', () => {
    const makeFieldTree = (props: any, ctx: any) =>
      shallow(<Field {...props} />, { context: { formik: ctx } });

    it('calls validate during onChange if present', () => {
      const registerField = jest.fn(noop);
      const validate = jest.fn(noop);
      const tree = makeFieldTree(
        { name: 'name', validate },
        {
          registerField,
          validateOnChange: true,
        }
      );
      tree.find('input').simulate('change', {
        persist: noop,
        target: {
          name: 'name',
          value: 'ian',
        },
      });
      expect(validate).toHaveBeenCalled();
    });

    it('does NOT call validate during onChange if validateOnChange is set to false', () => {
      const registerField = jest.fn(noop);
      const validate = jest.fn(noop);
      const tree = makeFieldTree(
        { name: 'name', validate },
        {
          registerField,
          validateOnChange: false,
        }
      );
      tree.find('input').simulate('change', {
        persist: noop,
        target: {
          name: 'name',
          value: 'ian',
        },
      });

      expect(validate).not.toHaveBeenCalled();
    });

    it('calls validate during onBlur if present', () => {
      const validate = jest.fn(noop);
      const registerField = jest.fn(noop);
      const setFormikState = jest.fn(noop);
      const tree = makeFieldTree(
        { name: 'name', validate },
        {
          registerField,
          setFormikState,
          validateOnBlur: true,
        }
      );
      tree.find('input').simulate('blur', {
        persist: noop,
        target: {
          name: 'name',
          value: 'ian',
        },
      });
      expect(setFormikState).toHaveBeenCalled();
      expect(registerField).toHaveBeenCalled();
      expect(validate).toHaveBeenCalled();
    });

    it('does NOT call validate during onBlur if validateOnBlur is set to false', () => {
      const validate = jest.fn(noop);
      const registerField = jest.fn(noop);
      const setFormikState = jest.fn(noop);
      const tree = makeFieldTree(
        { name: 'name', validate },
        {
          setFormikState,
          registerField,
          validateOnBlur: false,
        }
      );
      tree.find('input').simulate('blur', {
        persist: noop,
        target: {
          name: 'name',
          value: 'ian',
        },
      });
      expect(setFormikState).toHaveBeenCalled();
      expect(validate).not.toHaveBeenCalled();
    });
  });

  describe('<Field component />', () => {
    const node = document.createElement('div');

    const TEXT = 'Mrs. Kato';

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(node);
    });

    it('renders an <input /> by default', () => {
      ReactDOM.render(<TestForm render={() => <Field name="name" />} />, node);

      expect((node.firstChild as HTMLInputElement).name).toBe('name');
    });

    it('renders the component', () => {
      const SuperInput = () => <div>{TEXT}</div>;
      ReactDOM.render(
        <TestForm
          render={() => <Field name="name" component={SuperInput} />}
        />,
        node
      );

      expect((node.firstChild as HTMLInputElement).innerHTML).toBe(TEXT);
    });

    it('renders string components', () => {
      ReactDOM.render(
        <TestForm render={() => <Field component="textarea" name="name" />} />,
        node
      );

      expect((node.firstChild as HTMLTextAreaElement).name).toBe('name');
    });

    it('receives { field, form } props', () => {
      let actual: any; /** FieldProps<any> ;) */
      let injected: any; /** FieldProps<any> ;) */
      const Component: React.SFC<FieldProps<any>> = props =>
        (actual = props) && null;

      ReactDOM.render(
        <TestForm
          render={(formikProps: FormikProps<TestFormValues>) =>
            (injected = formikProps) && (
              <Field name="name" component={Component} />
            )
          }
        />,
        node
      );

      expect(actual.field.name).toBe('name');
      expect(actual.field.value).toBe('jared');
      expect(actual.form).toEqual(injected);
    });

    it('assigns innerRef as a ref to string components', () => {
      const innerRef = jest.fn();
      const tree = mount(<Field name="name" innerRef={innerRef} />, {
        context: {
          formik: {
            registerField: jest.fn(noop),
          },
        },
      });
      const element = tree.find('input').instance();
      expect(innerRef).toHaveBeenCalledWith(element);
    });

    it('forwards innerRef to React component', () => {
      let actual: any; /** FieldProps ;) */
      const Component: React.SFC<FieldProps> = props =>
        (actual = props) && null;

      const innerRef = jest.fn();

      ReactDOM.render(
        <TestForm
          render={() => (
            <Field name="name" component={Component} innerRef={innerRef} />
          )}
        />,
        node
      );
      expect(actual.innerRef).toBe(innerRef);
    });
  });

  describe('<Field render />', () => {
    const node = document.createElement('div');
    const placeholder = 'First name';
    const TEXT = 'Mrs. Kato';

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(node);
    });

    it('renders its return value', () => {
      ReactDOM.render(
        <TestForm
          render={() => <Field name="name" render={() => <div>{TEXT}</div>} />}
        />,
        node
      );

      expect(node.innerHTML).toContain(TEXT);
    });

    it('receives { field, form } props', () => {
      ReactDOM.render(
        <TestForm
          render={(formikProps: FormikProps<TestFormValues>) => (
            <Field
              placeholder={placeholder}
              name="name"
              testingAnArbitraryProp="thing"
              render={({ field, form }: FieldProps<any>) => {
                expect(field.name).toBe('name');
                expect(field.value).toBe('jared');
                expect(form).toEqual(formikProps);

                return null;
              }}
            />
          )}
        />,
        node
      );
    });
  });

  describe('<Field children />', () => {
    const node = document.createElement('div');

    const TEXT = 'Mrs. Kato';

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(node);
    });

    it('renders a function', () => {
      ReactDOM.render(
        <TestForm
          render={() => (
            <Field name="name" children={() => <div>{TEXT}</div>} />
          )}
        />,
        node
      );

      expect(node.innerHTML).toContain(TEXT);
    });

    it('renders a child element', () => {
      ReactDOM.render(
        <TestForm
          render={() => (
            <Field name="name" component="select">
              <option value="Jared" label={TEXT} />
              <option value="Jared" label={TEXT} />
            </Field>
          )}
        />,
        node
      );

      expect(node.innerHTML).toContain(TEXT);
    });

    it('warns if both string component and children as a function', () => {
      let output = '';

      (global as any).console = {
        error: jest.fn(input => (output += input)),
      };

      ReactDOM.render(
        <TestForm
          render={() => (
            <Field name="name" component="select">
              {() => <option value="Jared">{TEXT}</option>}
            </Field>
          )}
        />,
        node
      );

      expect(output).toContain(
        'Warning: You should not use <FastField component> and <FastField children> as a function in the same <FastField> component; <FastField component> will be ignored.'
      );
    });

    it('warns if both non-string component and children as a function', () => {
      let output = '';
      let actual;
      const Component: React.SFC<FieldProps<any>> = props =>
        (actual = props) && null;

      (global as any).console = {
        error: jest.fn(input => (output += input)),
      };

      ReactDOM.render(
        <TestForm
          render={() => (
            <Field component={Component} name="name">
              {() => <option value="Jared">{TEXT}</option>}
            </Field>
          )}
        />,
        node
      );

      expect(output).toContain(
        'Warning: You should not use <FastField component> and <FastField children> as a function in the same <FastField> component; <FastField component> will be ignored.'
      );
    });

    it('warns if both string component and render', () => {
      let output = '';

      (global as any).console = {
        error: jest.fn(input => (output += input)),
      };

      ReactDOM.render(
        <TestForm
          render={() => (
            <Field
              component="select"
              name="name"
              render={() => <div>{TEXT}</div>}
            />
          )}
        />,
        node
      );

      expect(output).toContain(
        'Warning: You should not use <FastField component> and <FastField render> in the same <FastField> component; <FastField component> will be ignored'
      );
    });

    it('warns if both non-string component and render', () => {
      let output = '';
      let actual;
      const Component: React.SFC<FieldProps<any>> = props =>
        (actual = props) && null;

      (global as any).console = {
        error: jest.fn(input => (output += input)),
      };

      ReactDOM.render(
        <TestForm
          render={() => (
            <Field
              component={Component}
              name="name"
              render={() => <div>{TEXT}</div>}
            />
          )}
        />,
        node
      );

      expect(output).toContain(
        'Warning: You should not use <FastField component> and <FastField render> in the same <FastField> component; <FastField component> will be ignored'
      );
    });

    it('warns if both children and render', () => {
      let output = '';

      (global as any).console = {
        error: jest.fn(input => (output += input)),
      };

      ReactDOM.render(
        <TestForm
          render={() => (
            <Field name="name" render={() => <div>{TEXT}</div>}>
              <div>{TEXT}</div>
            </Field>
          )}
        />,
        node
      );

      expect(output).toContain(
        'Warning: You should not use <FastField render> and <FastField children> in the same <FastField> component; <FastField children> will be ignored'
      );
    });

    it('renders a child function', () => {
      ReactDOM.render(
        <TestForm
          render={() => <Field name="name">{() => <div>{TEXT}</div>}</Field>}
        />,
        node
      );

      expect(node.innerHTML).toContain(TEXT);
    });

    it('receives { field, form } props', () => {
      let actual: any;
      let injected: any;
      const Component: React.SFC<FieldProps<any>> = props =>
        (actual = props) && null;

      ReactDOM.render(
        <TestForm
          children={(formikProps: FormikProps<TestFormValues>) =>
            (injected = formikProps) && (
              <Field name="name" component={Component} placeholder="hello" />
            )
          }
        />,
        node
      );
      expect(actual.field.name).toBe('name');
      expect(actual.field.value).toBe('jared');
      expect(actual.form).toEqual(injected);
    });

    it('can resolve bracket paths', () => {
      let actual: any;
      let injected: any;
      const Component: React.SFC<FieldProps<any>> = props =>
        (actual = props) && null;

      ReactDOM.render(
        <TestForm
          initialValues={{ user: { superPowers: ['Surging', 'Binding'] } }}
          children={(formikProps: FormikProps<TestFormValues>) =>
            (injected = formikProps) && (
              <Field name="user[superPowers][0]" component={Component} />
            )
          }
        />,
        node
      );
      expect(actual.field.value).toBe('Surging');
    });

    it('can resolve mixed dot and bracket paths', () => {
      let actual: any;
      let injected: any;
      const Component: React.SFC<FieldProps<any>> = props =>
        (actual = props) && null;

      ReactDOM.render(
        <TestForm
          initialValues={{ user: { superPowers: ['Surging', 'Binding'] } }}
          children={(formikProps: FormikProps<TestFormValues>) =>
            (injected = formikProps) && (
              <Field name="user.superPowers[1]" component={Component} />
            )
          }
        />,
        node
      );
      expect(actual.field.value).toBe('Binding');
    });

    it('can resolve mixed dot and bracket paths II', () => {
      let actual: any;
      let injected: any;
      const Component: React.SFC<FieldProps<any>> = props =>
        (actual = props) && null;

      ReactDOM.render(
        <TestForm
          initialValues={{ user: { superPowers: ['Surging', 'Binding'] } }}
          children={(formikProps: FormikProps<TestFormValues>) =>
            (injected = formikProps) && (
              <Field name="user[superPowers].1" component={Component} />
            )
          }
        />,
        node
      );
      expect(actual.field.value).toBe('Binding');
    });
  });
});
