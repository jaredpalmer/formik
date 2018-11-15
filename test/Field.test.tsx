import * as React from 'react';
import { cleanup, render, wait, fireEvent } from 'react-testing-library';
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
  props: Partial<FieldConfig> = {},
  formProps?: Partial<FormikConfig<Values>>
) => {
  let injected: FieldProps;

  if (!props.children && !props.render && !props.component) {
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
    it('<FastField />', async () => Promise.resolve(tester(renderFastField)));
    it('<Field />', async () => Promise.resolve(tester(renderField)));
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

  describe('receives { field, form } props and renders element', () => {
    it('<Field />', () => {
      let injected: FieldProps[] = [];

      const Component = (props: FieldProps) =>
        injected.push(props) && <div data-testid="child">{TEXT}</div>;

      const { getFormProps, queryAllByText } = renderForm(
        <>
          <Field name="name" children={Component} />
          <Field name="name" render={Component} />
          <Field name="name" component={Component} />
        </>
      );

      injected.forEach(props => {
        const { handleBlur, handleChange } = getFormProps();
        expect(props.field.name).toBe('name');
        expect(props.field.value).toBe('jared');
        expect(props.field.onChange).toBe(handleChange);
        expect(props.field.onBlur).toBe(handleBlur);
        expect(props.form).toEqual(getFormProps());
      });

      expect(queryAllByText(TEXT)).toHaveLength(3);
    });

    it('<FastField />', () => {
      let injected: FieldProps[] = [];

      const Component = (props: FieldProps) =>
        injected.push(props) && <div>{TEXT}</div>;

      const { getFormProps, queryAllByText } = renderForm(
        <>
          <FastField name="name" children={Component} />
          <FastField name="name" render={Component} />
          <FastField name="name" component={Component} />
        </>
      );

      injected.forEach(props => {
        const { handleBlur, handleChange } = getFormProps();
        expect(props.field.name).toBe('name');
        expect(props.field.value).toBe('jared');
        expect(props.field.onChange).toBe(handleChange);
        expect(props.field.onBlur).toBe(handleBlur);
        expect(props.form).toEqual(getFormProps());
      });

      expect(queryAllByText(TEXT)).toHaveLength(3);
    });
  });

  describe('children', () => {
    cases('renders a child element', () => {
      const { container } = renderForm(
        <Field name="name" component="select">
          <option value="Jared" label={TEXT} />
          <option value="Jared" label={TEXT} />
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

      expect(container.firstChild.type).toBe('textarea');
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
      await wait(() => {
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
        await wait(() => {
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
      await wait(() => {
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

        await wait(() => expect(validate).not.toHaveBeenCalled());
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
        getFormProps().validateField('name');
        rerender();
        await wait(() => {
          expect(validate).toHaveBeenCalled();
          expect(getFormProps().errors.name).toBe('Error!');
        });
      }
    );

    cases(
      'runs validation when validateField is called (ASYNC)',
      async renderField => {
        const validate = jest.fn(() => Promise.resolve('Error!'));
        const { getFormProps, rerender } = renderField({
          validate,
          component: 'input',
        });

        rerender();
        await getFormProps().validateField('name');
        rerender();
        await wait(() => {
          expect(validate).toHaveBeenCalled();
          expect(getFormProps().errors.name).toBe('Error!');
        });
      }
    );
  });

  cases('can resolve bracket paths', renderField => {
    const { getProps } = renderField(
      { name: 'user[superPowers][0]' },
      { initialValues: { user: { superPowers: ['Surging', 'Binding'] } } } // TODO: fix generic type
    );

    expect(getProps().field.value).toBe('Surging');
  });

  cases('can resolve mixed dot and bracket paths', renderField => {
    const { getProps } = renderField(
      { name: 'user.superPowers[1]' },
      { initialValues: { user: { superPowers: ['Surging', 'Binding'] } } } // TODO: fix generic type
    );

    expect(getProps().field.value).toBe('Binding');
  });

  cases('can resolve mixed dot and bracket paths II', renderField => {
    const { getProps } = renderField(
      // tslint:disable-next-line:quotemark
      { name: "user['superPowers'].1" },
      { initialValues: { user: { superPowers: ['Surging', 'Binding'] } } } // TODO: fix generic type
    );

    expect(getProps().field.value).toBe('Binding');
  });
});
