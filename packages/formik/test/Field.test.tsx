import * as React from 'react';
import {
  act,
  cleanup,
  render,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import * as Yup from 'yup';
import {
  Formik,
  Field,
  FastField,
  FieldProps,
  FieldConfig,
  FormikProps,
  FormikConfig,
} from '../src';

import { noop } from './testHelpers';

const initialValues = { name: 'jared', email: 'hello@reason.nyc' };
type Values = typeof initialValues;
type FastFieldConfig = FieldConfig;

type $FixMe = any;

function renderForm(
  ui?: React.ReactNode,
  props?: Partial<FormikConfig<Values>>
) {
  let injected: FormikProps<Values>;
  const { rerender, ...rest } = render(
    <Formik onSubmit={noop} initialValues={initialValues} {...props}>
      {(formikProps: FormikProps<Values>) =>
        (injected = formikProps) && ui ? ui : null
      }
    </Formik>
  );

  return {
    getFormProps(): FormikProps<Values> {
      return injected;
    },
    ...rest,
    rerender: () =>
      rerender(
        <Formik onSubmit={noop} initialValues={initialValues} {...props}>
          {(formikProps: FormikProps<Values>) =>
            (injected = formikProps) && ui ? ui : null
          }
        </Formik>
      ),
  };
}

const createRenderField = (
  FieldComponent: React.ComponentType<FieldConfig>
) => (
  props: Partial<FieldConfig> | Partial<FastFieldConfig> = {},
  formProps?: Partial<FormikConfig<Values>>
) => {
  let injected: FieldProps;

  if (!props.children && !props.render && !props.component && !props.as) {
    props.children = (fieldProps: FieldProps) =>
      (injected = fieldProps) && (
        <input {...fieldProps.field} name="name" data-testid="name-input" />
      );
  }

  return {
    getProps() {
      return injected;
    },
    ...renderForm(
      <FieldComponent name="name" data-testid="name-input" {...props} />,
      formProps
    ),
  };
};

const renderField = createRenderField(Field);
const renderFastField = createRenderField(FastField);

function cases(
  title: string,
  tester: (arg: typeof renderField | typeof renderFastField) => void
) {
  describe(title, () => {
    it('<FastField />', async () => await tester(renderFastField));
    it('<Field />', async () => await tester(renderField));
  });
}

const TEXT = 'Mrs. Kato';

describe('Field / FastField', () => {
  afterEach(cleanup);

  describe('renders an <input /> by default', () => {
    it('<Field />', () => {
      const { container } = renderForm(<Field name="name" />);
      expect(container.querySelectorAll('input')).toHaveLength(1);
    });

    it('<FastField />', () => {
      const { container } = renderForm(<FastField name="name" />);
      expect(container.querySelectorAll('input')).toHaveLength(1);
    });
  });

  describe('receives { field, form, meta } props and renders element', () => {
    it('<Field />', () => {
      let injected: FieldProps[] = [];
      let asInjectedProps: FieldProps['field'] = {} as any;

      const Component = (props: FieldProps) =>
        injected.push(props) && <div data-testid="child">{TEXT}</div>;

      const AsComponent = (props: FieldProps['field']) =>
        (asInjectedProps = props) && <div data-testid="child">{TEXT}</div>;

      const { getFormProps, queryAllByText } = renderForm(
        <>
          <Field name="name" children={Component} />
          <Field name="name" render={Component} />
          <Field name="name" component={Component} />
          <Field name="name" as={AsComponent} />
        </>
      );

      const { handleBlur, handleChange } = getFormProps();
      injected.forEach((props, idx) => {
        expect(props.field.name).toBe('name');
        expect(props.field.value).toBe('jared');
        expect(props.field.onChange).toBe(handleChange);
        expect(props.field.onBlur).toBe(handleBlur);
        expect(props.form).toEqual(getFormProps());
        if (idx !== 2) {
          expect(props.meta.value).toBe('jared');
          expect(props.meta.error).toBeUndefined();
          expect(props.meta.touched).toBe(false);
          expect(props.meta.initialValue).toEqual('jared');
        } else {
          // Ensure that we do not pass through `meta` to
          // <Field component> or <Field render>
          expect(props.meta).toBeUndefined();
        }
      });

      expect(asInjectedProps.name).toBe('name');
      expect(asInjectedProps.value).toBe('jared');
      expect(asInjectedProps.onChange).toBe(handleChange);
      expect(asInjectedProps.onBlur).toBe(handleBlur);

      expect(queryAllByText(TEXT)).toHaveLength(4);
    });

    it('<FastField />', () => {
      let injected: FieldProps[] = [];
      let asInjectedProps: FieldProps['field'] = {} as any;

      const Component = (props: FieldProps) =>
        injected.push(props) && <div>{TEXT}</div>;
      const AsComponent = (props: FieldProps['field']) =>
        (asInjectedProps = props) && <div data-testid="child">{TEXT}</div>;

      const { getFormProps, queryAllByText } = renderForm(
        <>
          <FastField name="name" children={Component} />
          <FastField name="name" render={Component} />
          {/* @todo fix the types here?? #shipit */}
          <FastField name="name" component={Component as $FixMe} />
          <FastField name="name" as={AsComponent} />
        </>
      );

      const { handleBlur, handleChange } = getFormProps();
      injected.forEach((props, idx) => {
        expect(props.field.name).toBe('name');
        expect(props.field.value).toBe('jared');
        expect(props.field.onChange).toBe(handleChange);
        expect(props.field.onBlur).toBe(handleBlur);
        expect(props.form).toEqual(getFormProps());
        if (idx !== 2) {
          expect(props.meta.value).toBe('jared');
          expect(props.meta.error).toBeUndefined();
          expect(props.meta.touched).toBe(false);
          expect(props.meta.initialValue).toEqual('jared');
        } else {
          // Ensure that we do not pass through `meta` to
          // <Field component> or <Field render>
          expect(props.meta).toBeUndefined();
        }
      });

      expect(asInjectedProps.name).toBe('name');
      expect(asInjectedProps.value).toBe('jared');
      expect(asInjectedProps.onChange).toBe(handleChange);
      expect(asInjectedProps.onBlur).toBe(handleBlur);
      expect(queryAllByText(TEXT)).toHaveLength(4);
    });
  });

  describe('children', () => {
    cases('renders a child element with component', () => {
      const { container } = renderForm(
        <Field name="name" component="select">
          <option value="Jared" label={TEXT} />
          <option value="Brent" label={TEXT} />
        </Field>
      );

      expect(container.querySelectorAll('option')).toHaveLength(2);
    });

    cases('renders a child element with as', () => {
      const { container } = renderForm(
        <Field name="name" as="select">
          <option value="Jared" label={TEXT} />
          <option value="Brent" label={TEXT} />
        </Field>
      );

      expect(container.querySelectorAll('option')).toHaveLength(2);
    });
  });

  describe('component', () => {
    cases('renders string components', renderField => {
      const { container } = renderField({
        component: 'textarea',
      });

      expect((container.firstChild as $FixMe).type).toBe('textarea');
    });

    cases('assigns innerRef as a ref to string components', renderField => {
      const innerRef = jest.fn();
      const { container } = renderField({
        innerRef,
        component: 'input',
      });

      expect(innerRef).toHaveBeenCalledWith(container.firstChild);
    });

    cases('forwards innerRef to React component', renderField => {
      let injected: any; /** FieldProps ;) */
      const Component = (props: FieldProps) => (injected = props) && null;

      const innerRef = jest.fn();
      renderField({ component: Component, innerRef });
      expect(injected.innerRef).toBe(innerRef);
    });
  });

  describe('as', () => {
    cases('renders string components', renderField => {
      const { container } = renderField({
        as: 'textarea',
      });

      expect((container.firstChild as $FixMe).type).toBe('textarea');
    });

    cases('assigns innerRef as a ref to string components', renderField => {
      const innerRef = jest.fn();
      const { container } = renderField({
        innerRef,
        as: 'input',
      });

      expect(innerRef).toHaveBeenCalledWith(container.firstChild);
    });

    cases('forwards innerRef to React component', renderField => {
      let injected: any; /** FieldProps ;) */
      const Component = (props: FieldProps['field']) =>
        (injected = props) && null;

      const innerRef = jest.fn();
      renderField({ as: Component, innerRef });
      expect(injected.innerRef).toBe(innerRef);
    });
  });

  describe('validate', () => {
    cases('calls validate during onChange if present', async renderField => {
      const validate = jest.fn();
      const { getByTestId, rerender } = renderField({
        validate,
        component: 'input',
      });
      rerender();
      fireEvent.change(getByTestId('name-input'), {
        target: { name: 'name', value: 'hello' },
      });

      rerender();
      await waitFor(() => {
        expect(validate).toHaveBeenCalled();
      });
    });

    cases(
      'does NOT call validate during onChange if validateOnChange is set to false',
      async renderField => {
        const validate = jest.fn();
        const { getByTestId, rerender } = renderField(
          { validate, component: 'input' },
          { validateOnChange: false }
        );
        rerender();
        fireEvent.change(getByTestId('name-input'), {
          target: { name: 'name', value: 'hello' },
        });
        rerender();
        await waitFor(() => {
          expect(validate).not.toHaveBeenCalled();
        });
      }
    );

    cases('calls validate during onBlur if present', async renderField => {
      const validate = jest.fn();
      const { getByTestId, rerender } = renderField({
        validate,
        component: 'input',
      });
      rerender();
      fireEvent.blur(getByTestId('name-input'), {
        target: { name: 'name' },
      });
      rerender();
      await waitFor(() => {
        expect(validate).toHaveBeenCalled();
      });
    });

    cases(
      'does NOT call validate during onBlur if validateOnBlur is set to false',
      async renderField => {
        const validate = jest.fn();
        const { getByTestId, rerender } = renderField(
          { validate, component: 'input' },
          { validateOnBlur: false }
        );

        rerender();
        fireEvent.blur(getByTestId('name-input'), {
          target: { name: 'name' },
        });
        rerender();

        await waitFor(() => expect(validate).not.toHaveBeenCalled());
      }
    );

    cases(
      'runs validation when validateField is called (SYNC)',
      async renderField => {
        const validate = jest.fn(() => 'Error!');
        const { getFormProps, rerender } = renderField({
          validate,
          component: 'input',
        });
        rerender();

        act(() => {
          getFormProps().validateField('name');
        });

        rerender();
        await waitFor(() => {
          expect(validate).toHaveBeenCalled();
          expect(getFormProps().errors.name).toBe('Error!');
        });
      }
    );

    cases(
      'runs validation when validateField is called (ASYNC)',
      async renderField => {
        const validate = jest.fn(() => Promise.resolve('Error!'));

        const { getFormProps, rerender } = renderField({ validate });

        // workaround for `useEffect` to run: https://github.com/facebook/react/issues/14050
        rerender();

        act(() => {
          getFormProps().validateField('name');
        });

        expect(validate).toHaveBeenCalled();
        await waitFor(() => expect(getFormProps().errors.name).toBe('Error!'));
      }
    );

    cases(
      'runs validationSchema validation when validateField is called',
      async renderField => {
        const errorMessage = 'Name must be 100 characters in length';

        const validationSchema = Yup.object({
          name: Yup.string().min(100, errorMessage),
        });
        const { getFormProps, rerender } = renderField(
          {},
          { validationSchema }
        );

        rerender();

        act(() => {
          getFormProps().validateField('name');
        });

        await waitFor(() =>
          expect(getFormProps().errors).toEqual({
            name: errorMessage,
          })
        );
      }
    );
  });

  describe('warnings', () => {
    cases('warns about render prop deprecation', renderField => {
      global.console.warn = jest.fn();
      const { rerender } = renderField({
        render: () => null,
      });
      rerender();
      expect((global.console.warn as jest.Mock).mock.calls[0][0]).toContain(
        'deprecated'
      );
    });

    cases(
      'warns if both string component and children as a function',
      renderField => {
        global.console.warn = jest.fn();

        const { rerender } = renderField({
          component: 'select',
          children: () => <option value="Jared">{TEXT}</option>,
        });
        rerender();
        expect((global.console.warn as jest.Mock).mock.calls[0][0]).toContain(
          'Warning:'
        );
      }
    );

    cases(
      'warns if both string as prop and children as a function',
      renderField => {
        global.console.warn = jest.fn();

        const { rerender } = renderField({
          as: 'select',
          children: () => <option value="Jared">{TEXT}</option>,
        });
        rerender();
        expect((global.console.warn as jest.Mock).mock.calls[0][0]).toContain(
          'Warning:'
        );
      }
    );

    cases(
      'warns if both non-string component and children children as a function',
      renderField => {
        global.console.warn = jest.fn();

        const { rerender } = renderField({
          component: () => null,
          children: () => <option value="Jared">{TEXT}</option>,
        });
        rerender();
        expect((global.console.warn as jest.Mock).mock.calls[0][0]).toContain(
          'Warning:'
        );
      }
    );

    cases('warns if both string component and render', renderField => {
      global.console.warn = jest.fn();

      const { rerender } = renderField({
        component: 'textarea',
        render: () => <option value="Jared">{TEXT}</option>,
      });
      rerender();
      expect((global.console.warn as jest.Mock).mock.calls[0][0]).toContain(
        'Warning:'
      );
    });

    cases('warns if both non-string component and render', renderField => {
      global.console.warn = jest.fn();

      const { rerender } = renderField({
        component: () => null,
        render: () => <option value="Jared">{TEXT}</option>,
      });
      rerender();
      expect((global.console.warn as jest.Mock).mock.calls[0][0]).toContain(
        'Warning:'
      );
    });

    cases('warns if both children and render', renderField => {
      global.console.warn = jest.fn();

      const { rerender } = renderField({
        children: <div>{TEXT}</div>,
        render: () => <div>{TEXT}</div>,
      });
      rerender();
      expect((global.console.warn as jest.Mock).mock.calls[0][0]).toContain(
        'Warning:'
      );
    });
  });

  cases('can resolve bracket paths', renderField => {
    const { getProps } = renderField(
      { name: 'user[superPowers][0]' },
      {
        initialValues: { user: { superPowers: ['Surging', 'Binding'] } } as any,
      } // TODO: fix generic type
    );

    expect(getProps().field.value).toBe('Surging');
  });

  cases('can resolve mixed dot and bracket paths', renderField => {
    const { getProps } = renderField(
      { name: 'user.superPowers[1]' },
      {
        initialValues: { user: { superPowers: ['Surging', 'Binding'] } } as any,
      } // TODO: fix generic type
    );

    expect(getProps().field.value).toBe('Binding');
  });

  cases('can resolve mixed dot and bracket paths II', renderField => {
    const { getProps } = renderField(
      // tslint:disable-next-line:quotemark
      { name: "user['superPowers'].1" },
      {
        initialValues: { user: { superPowers: ['Surging', 'Binding'] } } as any,
      } // TODO: fix generic type
    );

    expect(getProps().field.value).toBe('Binding');
  });
});

// @todo Deprecated
// describe('<FastField />', () => {
//   it('does NOT forward shouldUpdate to React component', () => {
//     let injected: any;
//     const Component = (props: FieldProps) => (injected = props) && null;

//     const shouldUpdate = () => true;
//     renderFastField({ component: Component, shouldUpdate });
//     expect(injected.shouldUpdate).toBe(undefined);
//   });
// });
