import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Yup from 'yup';
import { Formik, FormikProps } from '../src';
import { shallow, mount } from 'enzyme';
import { sleep, noop } from './testHelpers';
import { render, cleanup, fireEvent } from 'react-testing-library';

jest.spyOn(global.console, 'error');

interface Values {
  name: string;
}

const Form: React.SFC<FormikProps<Values>> = ({
  values,
  touched,
  handleSubmit,
  handleChange,
  handleBlur,
  status,
  errors,
  isSubmitting,
}) => {
  return (
    <form onSubmit={handleSubmit} data-testid="form">
      <input
        type="text"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.name}
        name="name"
        data-testid="name-input"
      />
      {touched.name && errors.name && <div id="feedback">{errors.name}</div>}
      {isSubmitting && <div id="submitting">Submitting</div>}
      {status &&
        !!status.myStatusMessage && (
          <div id="statusMessage">{status.myStatusMessage}</div>
        )}
      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </form>
  );
};

const BasicForm = (
  <Formik initialValues={{ name: 'jared' }} onSubmit={noop} component={Form} />
);

class WithState extends React.Component<{}, { data: { name: string } }> {
  constructor(props: {}) {
    super(props);
    this.state = {
      data: { name: 'ivan' },
    };
  }

  render() {
    return (
      <Formik
        initialValues={this.state.data}
        onSubmit={noop}
        component={Form}
      />
    );
  }
}

describe('<Formik> alt', () => {
  const InitialValues = { name: 'jared' };
  // Cleanup the dom after each test.
  // https://github.com/kentcdodds/react-testing-library#example
  afterEach(cleanup);

  it('should initialize Formik state and pass down props', () => {
    let injected: any;
    render(
      <Formik
        initialValues={InitialValues}
        onSubmit={noop}
        render={formikProps => (injected = formikProps) && null}
      />
    );
    expect(injected.isSubmitting).toBe(false);
    expect(injected.touched).toEqual({});
    expect(injected.values).toEqual(InitialValues);
    expect(injected.errors).toEqual({});
    expect(injected.dirty).toBe(false);
    expect(injected.isValid).toBe(false);
    expect(injected.submitCount).toBe(0);
  });

  describe('handleChange', () => {
    it('updates values based on name attribute', async () => {
      let injected: any;
      const { getByTestId } = render(
        <Formik initialValues={InitialValues} onSubmit={noop}>
          {formikProps => (injected = formikProps) && <Form {...formikProps} />}
        </Formik>
      );
      const input = getByTestId('name-input');

      expect(injected.values.name).toEqual(InitialValues.name);

      fireEvent.change(input, {
        persist: noop,
        target: {
          name: 'name',
          value: 'ian',
        },
      });

      expect(injected.values.name).toEqual('ian');
    });

    it('updates values when passed a string (overloaded)', async () => {
      let injected: any;
      const { getByTestId } = render(
        <Formik initialValues={InitialValues} onSubmit={noop}>
          {formikProps =>
            (injected = formikProps) && (
              <input
                onChange={formikProps.handleChange('name')}
                data-testid="name-input"
              />
            )
          }
        </Formik>
      );
      const input = getByTestId('name-input');

      expect(injected.values.name).toEqual(InitialValues.name);

      fireEvent.change(input, {
        persist: noop,
        target: {
          name: 'name',
          value: 'ian',
        },
      });

      expect(injected.values.name).toEqual('ian');
    });

    it('updates values via `name` instead of `id` attribute when both are present', async () => {
      let injected: any;
      const { getByTestId } = render(
        <Formik initialValues={InitialValues} onSubmit={noop}>
          {formikProps => (injected = formikProps) && <Form {...formikProps} />}
        </Formik>
      );
      const input = getByTestId('name-input');

      expect(injected.values.name).toEqual(InitialValues.name);

      fireEvent.change(input, {
        persist: noop,
        target: {
          id: 'person-1-thinger',
          name: 'name',
          value: 'ian',
        },
      });

      expect(injected.values.name).toEqual('ian');
    });

    it('updates values when passed a string (overloaded)', async () => {
      let injected: any;
      const { getByTestId } = render(
        <Formik initialValues={InitialValues} onSubmit={noop}>
          {formikProps =>
            (injected = formikProps) && (
              <input
                onChange={formikProps.handleChange('name')}
                data-testid="name-input"
              />
            )
          }
        </Formik>
      );
      const input = getByTestId('name-input');

      expect(injected.values.name).toEqual('jared');
      fireEvent.change(input, {
        target: {
          name: 'name',
          value: 'ian',
        },
      });

      expect(injected.values.name).toEqual('ian');
    });

    it('runs validations by default', async () => {
      const validate = jest.fn(() => Promise.resolve());
      // let's just recycle here
      const validationSchema = {
        validate,
      };
      const { getByTestId } = render(
        <Formik
          validate={validate}
          validationSchema={validationSchema}
          initialValues={InitialValues}
          onSubmit={noop}
          component={Form}
        />
      );
      const input = getByTestId('name-input');
      fireEvent.change(input, {
        persist: noop,
        target: {
          name: 'name',
          value: 'ian',
        },
      });
      expect(validate).toHaveBeenCalledTimes(2);
    });

    it('runs validations if validateOnChange is true', async () => {
      const validate = jest.fn(() => Promise.resolve());
      // let's just recycle here
      const validationSchema = {
        validate,
      };
      const { getByTestId } = render(
        <Formik
          validate={validate}
          validationSchema={validationSchema}
          initialValues={InitialValues}
          validateOnChange={true}
          onSubmit={noop}
          component={Form}
        />
      );
      const input = getByTestId('name-input');
      fireEvent.change(input, {
        persist: noop,
        target: {
          name: 'name',
          value: 'ian',
        },
      });
      expect(validate).toHaveBeenCalledTimes(2);
    });

    it('does NOT run validations if validateOnChange is false', async () => {
      const validate = jest.fn(() => Promise.resolve());
      const validationSchema = {
        validate,
      };
      const { getByTestId } = render(
        <Formik
          validate={validate}
          validationSchema={validationSchema}
          initialValues={InitialValues}
          validateOnChange={false}
          onSubmit={noop}
          component={Form}
        />
      );
      const input = getByTestId('name-input');
      fireEvent.change(input, {
        persist: noop,
        target: {
          name: 'name',
          value: 'ian',
        },
      });
      expect(validate).not.toHaveBeenCalled();
    });
  });

  describe('handleBlur', () => {
    it('sets touched state', async () => {
      let injected: any;
      const { getByTestId } = render(
        <Formik initialValues={InitialValues} onSubmit={noop}>
          {formikProps => (injected = formikProps) && <Form {...formikProps} />}
        </Formik>
      );
      const input = getByTestId('name-input');
      expect(injected.touched.name).toEqual(undefined);
      fireEvent.blur(input, {
        target: {
          name: 'name',
        },
      });
      expect(injected.touched.name).toEqual(true);
    });

    it('updates touched state via `name` instead of `id` attribute when both are present', async () => {
      let injected: any;
      const { getByTestId } = render(
        <Formik initialValues={InitialValues} onSubmit={noop}>
          {formikProps => (injected = formikProps) && <Form {...formikProps} />}
        </Formik>
      );
      const input = getByTestId('name-input');
      expect(injected.touched.name).toEqual(undefined);
      fireEvent.blur(input, {
        target: {
          id: 'blah',
          name: 'name',
        },
      });
      expect(injected.touched.name).toEqual(true);
    });

    it('updates touched when passed a string (overloaded)', async () => {
      let injected: any;
      const { getByTestId } = render(
        <Formik initialValues={InitialValues} onSubmit={noop}>
          {formikProps =>
            (injected = formikProps) && (
              <input
                onBlur={formikProps.handleBlur('name')}
                data-testid="name-input"
              />
            )
          }
        </Formik>
      );
      const input = getByTestId('name-input');

      expect(injected.touched.name).toEqual(undefined);
      fireEvent.blur(input, {
        target: {
          name: 'name',
          value: 'ian',
        },
      });

      expect(injected.touched.name).toEqual(true);
    });

    it('runs validate by default', async () => {
      const validate = jest.fn(noop);
      const { getByTestId } = render(
        <Formik
          validate={validate}
          initialValues={InitialValues}
          onSubmit={noop}
          component={Form}
        />
      );
      const input = getByTestId('name-input');
      fireEvent.blur(input, {
        target: {
          name: 'name',
        },
      });
      expect(validate).toHaveBeenCalled();
    });

    it('runs validations by default', async () => {
      const validate = jest.fn(() => Promise.resolve());
      const validationSchema = {
        validate,
      };
      const { getByTestId } = render(
        <Formik
          validate={validate}
          validationSchema={validationSchema}
          initialValues={InitialValues}
          onSubmit={noop}
          component={Form}
        />
      );
      const input = getByTestId('name-input');
      fireEvent.blur(input, {
        target: {
          name: 'name',
        },
      });
      expect(validate).toHaveBeenCalledTimes(2);
    });
    it('runs validations if validateOnBlur is true', async () => {
      const validate = jest.fn(() => Promise.resolve());
      const validationSchema = {
        validate,
      };
      const { getByTestId } = render(
        <Formik
          validate={validate}
          validationSchema={validationSchema}
          initialValues={InitialValues}
          validateOnBlur={true}
          onSubmit={noop}
          component={Form}
        />
      );
      const input = getByTestId('name-input');
      fireEvent.blur(input, {
        target: {
          name: 'name',
        },
      });
      expect(validate).toHaveBeenCalledTimes(2);
    });
    it('dost NOT run validations if validateOnBlur is false', async () => {
      const validate = jest.fn(() => Promise.resolve());
      const validationSchema = {
        validate,
      };
      const { getByTestId } = render(
        <Formik
          validate={validate}
          validationSchema={validationSchema}
          initialValues={InitialValues}
          validateOnBlur={false}
          onSubmit={noop}
          component={Form}
        />
      );
      const input = getByTestId('name-input');
      fireEvent.blur(input, {
        target: {
          name: 'name',
        },
      });
      expect(validate).not.toHaveBeenCalled();
    });
  });

  describe('handleSubmit', () => {
    it('should call preventDefault()', async () => {
      const preventDefault = jest.fn();
      const FormPreventDefault = (
        <Formik initialValues={{ name: 'jared' }} onSubmit={noop}>
          {({ handleSubmit }) => (
            <button
              data-testid="submit-button"
              onClick={() => handleSubmit({ preventDefault } as any)}
            />
          )}
        </Formik>
      );

      const { getByTestId } = render(FormPreventDefault);
      fireEvent.click(getByTestId('submit-button'));

      expect(preventDefault).toHaveBeenCalled();
    });

    it('should not error if called without an event', () => {
      const FormNoEvent = (
        <Formik initialValues={{ name: 'jared' }} onSubmit={noop}>
          {({ handleSubmit }) => (
            <button
              data-testid="submit-button"
              onClick={() =>
                handleSubmit(undefined as any /* undefined event */)
              }
            />
          )}
        </Formik>
      );
      const { getByTestId } = render(FormNoEvent);

      expect(() => {
        fireEvent.click(getByTestId('submit-button'));
      }).not.toThrow();
    });

    it('should not error if called without preventDefault property', () => {
      const FormNoPreventDefault = (
        <Formik initialValues={{ name: 'jared' }} onSubmit={noop}>
          {({ handleSubmit }) => (
            <button
              data-testid="submit-button"
              onClick={() => handleSubmit({} as any /* undefined event */)}
            />
          )}
        </Formik>
      );
      const { getByTestId } = render(FormNoPreventDefault);

      expect(() => {
        fireEvent.click(getByTestId('submit-button'));
      }).not.toThrow();
    });

    it('should touch all fields', () => {
      let injected: any;
      const { getByTestId } = render(
        <Formik initialValues={InitialValues} onSubmit={noop}>
          {formikProps => (injected = formikProps) && <Form {...formikProps} />}
        </Formik>
      );

      const form = getByTestId('form');
      expect(injected.touched).toEqual({});
      fireEvent.submit(form);
      expect(injected.touched).toEqual({ name: true });
    });

    it('should push submission state changes to child component', () => {
      let injected: any;
      const { getByTestId } = render(
        <Formik initialValues={InitialValues} onSubmit={noop}>
          {formikProps => (injected = formikProps) && <Form {...formikProps} />}
        </Formik>
      );

      const form = getByTestId('form');
      expect(injected.isSubmitting).toBeFalsy();
      fireEvent.submit(form);
      expect(injected.isSubmitting).toBeTruthy();
    });

    describe('with validate (SYNC)', () => {
      it('should call validate if present', () => {
        const validate = jest.fn(() => ({}));
        const { getByTestId } = render(
          <Formik
            initialValues={InitialValues}
            onSubmit={noop}
            validate={validate}
            component={Form}
          />
        );
        const form = getByTestId('form');
        fireEvent.submit(form);
        expect(validate).toHaveBeenCalled();
      });

      it('should submit the form if valid', () => {
        const onSubmit = jest.fn();
        const validate = jest.fn(() => ({}));

        const { getByTestId } = render(
          <Formik
            initialValues={{ name: 'jared' }}
            onSubmit={onSubmit}
            validate={validate}
            component={Form}
          />
        );
        const form = getByTestId('form');
        fireEvent.submit(form);
        // TODO: for some reason it's not being called
        expect(onSubmit).toBeCalled();
      });

      it('should not submit the form if invalid', () => {
        const onSubmit = jest.fn();
        const validate = jest.fn(() => ({ name: 'Error!' }));

        const { getByTestId } = render(
          <Formik
            initialValues={{ name: 'jared' }}
            onSubmit={onSubmit}
            validate={validate}
            component={Form}
          />
        );
        const form = getByTestId('form');
        fireEvent.submit(form);
        expect(onSubmit).not.toBeCalled();
      });
    });

    describe('with validate (ASYNC)', () => {
      it('should call validate if present', async () => {
        const validate = jest.fn(() => Promise.resolve({}));
        const { getByTestId } = render(
          <Formik
            initialValues={InitialValues}
            onSubmit={noop}
            validate={validate}
            component={Form}
          />
        );
        const form = getByTestId('form');
        fireEvent.submit(form);
        expect(validate).toHaveBeenCalled();
      });

      it('should submit the form if valid', async () => {
        const onSubmit = jest.fn();
        const validate = jest.fn(() => Promise.resolve({}));

        const { getByTestId } = render(
          <Formik
            initialValues={{ name: 'jared' }}
            onSubmit={onSubmit}
            validate={validate}
            component={Form}
          />
        );
        const form = getByTestId('form');
        fireEvent.submit(form);
        // TODO: for some reason it's not being called
        expect(onSubmit).toBeCalled();
      });

      it('should not submit the form if invalid', async () => {
        const onSubmit = jest.fn();
        const validate = jest.fn(() => Promise.resolve({ name: 'Error!' }));

        const { getByTestId } = render(
          <Formik
            initialValues={{ name: 'jared' }}
            onSubmit={onSubmit}
            validate={validate}
            component={Form}
          />
        );
        const form = getByTestId('form');
        fireEvent.submit(form);
        expect(onSubmit).not.toBeCalled();
      });
    });

    describe('with validationSchema (ASYNC)', () => {
      it('should run validationSchema if present', async () => {
        const validate = jest.fn(() => Promise.resolve({}));
        const { getByTestId } = render(
          <Formik
            initialValues={InitialValues}
            onSubmit={noop}
            validate={validate}
            validationSchema={{
              validate,
            }}
            component={Form}
          />
        );
        const form = getByTestId('form');
        fireEvent.submit(form);
        expect(validate).toHaveBeenCalled();
      });

      it('should call validationSchema if it is a function and present', async () => {
        const validate = jest.fn(() => Promise.resolve({}));
        const { getByTestId } = render(
          <Formik
            initialValues={InitialValues}
            onSubmit={noop}
            validate={validate}
            validationSchema={() => ({
              validate,
            })}
            component={Form}
          />
        );
        const form = getByTestId('form');
        fireEvent.submit(form);
        expect(validate).toHaveBeenCalled();
      });
    });

    describe('FormikActions', () => {
      it('setValues sets values', () => {
        let injected: any;
        render(
          <Formik initialValues={InitialValues} onSubmit={noop}>
            {formikProps =>
              (injected = formikProps) && <Form {...formikProps} />
            }
          </Formik>
        );

        injected.setValues({ name: 'ian' });
        expect(injected.values.name).toEqual('ian');
      });

      it('setValues should run validations when validateOnChange is true (default)', () => {
        const validate = jest.fn(() => ({}));
        let injected: any;
        render(
          <Formik
            initialValues={{ name: 'jared' }}
            onSubmit={noop}
            validate={validate}
            validateOnChange={true}
          >
            {formikProps =>
              (injected = formikProps) && <Form {...formikProps} />
            }
          </Formik>
        );
        injected.setValues({ name: 'ian' });
        expect(validate).toHaveBeenCalled();
      });

      it('setValues should NOT run validations when validateOnChange is false', () => {
        const validate = jest.fn();
        let injected: any;
        render(
          <Formik
            initialValues={{ name: 'jared' }}
            onSubmit={noop}
            validate={validate}
            validateOnChange={false}
          >
            {formikProps =>
              (injected = formikProps) && <Form {...formikProps} />
            }
          </Formik>
        );
        injected.setValues({ name: 'ian' });
        expect(validate).not.toHaveBeenCalled();
      });

      it('setFieldValue sets value by key', () => {
        let injected: any;
        render(
          <Formik initialValues={InitialValues} onSubmit={noop}>
            {formikProps =>
              (injected = formikProps) && <Form {...formikProps} />
            }
          </Formik>
        );

        injected.setFieldValue('name', 'ian');
        expect(injected.values.name).toEqual('ian');
      });

      it('setFieldValue should run validations when validateOnChange is true (default)', () => {
        const validate = jest.fn(() => ({}));

        let injected: any;
        render(
          <Formik
            initialValues={InitialValues}
            onSubmit={noop}
            validate={validate}
          >
            {formikProps =>
              (injected = formikProps) && <Form {...formikProps} />
            }
          </Formik>
        );

        injected.setFieldValue('name', 'ian');
        expect(validate).toHaveBeenCalled();
      });

      it('setFieldValue should NOT run validations when validateOnChange is false', () => {
        const validate = jest.fn();
        let injected: any;
        render(
          <Formik
            initialValues={InitialValues}
            onSubmit={noop}
            validate={validate}
            validateOnChange={false}
          >
            {formikProps =>
              (injected = formikProps) && <Form {...formikProps} />
            }
          </Formik>
        );

        injected.setFieldValue('name', 'ian');
        expect(validate).not.toHaveBeenCalled();
      });

      it('setTouched sets touched', () => {
        let injected: any;
        render(
          <Formik initialValues={InitialValues} onSubmit={noop}>
            {formikProps =>
              (injected = formikProps) && <Form {...formikProps} />
            }
          </Formik>
        );

        injected.setTouched({ name: true });
        expect(injected.touched).toEqual({ name: true });
      });

      it('setTouched should NOT run validations when validateOnChange is true (default)', () => {
        const validate = jest.fn(() => ({}));
        let injected: any;
        render(
          <Formik
            initialValues={InitialValues}
            onSubmit={noop}
            validate={validate}
          >
            {formikProps =>
              (injected = formikProps) && <Form {...formikProps} />
            }
          </Formik>
        );

        injected.setTouched({ name: true });
        expect(validate).toHaveBeenCalled();
      });

      it('setTouched should run validations when validateOnBlur is false', () => {
        const validate = jest.fn(() => ({}));
        let injected: any;
        render(
          <Formik
            initialValues={InitialValues}
            onSubmit={noop}
            validate={validate}
            validateOnBlur={false}
          >
            {formikProps =>
              (injected = formikProps) && <Form {...formikProps} />
            }
          </Formik>
        );

        injected.setTouched({ name: true });
        expect(validate).not.toHaveBeenCalled();
      });

      it('setFieldTouched sets touched by key', () => {
        let injected: any;
        render(
          <Formik initialValues={InitialValues} onSubmit={noop}>
            {formikProps =>
              (injected = formikProps) && <Form {...formikProps} />
            }
          </Formik>
        );

        injected.setFieldTouched('name', true);
        expect(injected.touched).toEqual({ name: true });
        expect(injected.dirty).toBe(false);

        injected.setFieldTouched('name', false);
        expect(injected.touched).toEqual({ name: false });
        expect(injected.dirty).toBe(false);
      });

      it('setFieldTouched should run validations when validateOnBlur is true (default)', () => {
        const validate = jest.fn(() => ({}));
        let injected: any;
        render(
          <Formik
            initialValues={InitialValues}
            onSubmit={noop}
            validate={validate}
          >
            {formikProps =>
              (injected = formikProps) && <Form {...formikProps} />
            }
          </Formik>
        );

        injected.setFieldTouched('name', true);
        expect(validate).toHaveBeenCalled();
      });

      it('setFieldTouched should NOT run validations when validateOnBlur is false', () => {
        const validate = jest.fn(() => ({}));
        let injected: any;
        render(
          <Formik
            initialValues={InitialValues}
            onSubmit={noop}
            validate={validate}
            validateOnBlur={false}
          >
            {formikProps =>
              (injected = formikProps) && <Form {...formikProps} />
            }
          </Formik>
        );

        injected.setFieldTouched('name', true);
        expect(validate).not.toHaveBeenCalled();
      });

      it('setErrors sets error object', () => {
        let injected: any;
        render(
          <Formik initialValues={InitialValues} onSubmit={noop}>
            {formikProps =>
              (injected = formikProps) && <Form {...formikProps} />
            }
          </Formik>
        );

        injected.setErrors({ name: 'Required' });
        expect(injected.errors.name).toEqual('Required');
      });

      it('setFieldError sets error by key', () => {
        let injected: any;
        render(
          <Formik initialValues={InitialValues} onSubmit={noop}>
            {formikProps =>
              (injected = formikProps) && <Form {...formikProps} />
            }
          </Formik>
        );

        injected.setFieldError('name', 'Required');
        expect(injected.errors.name).toEqual('Required');
      });

      it('setStatus sets status object', () => {
        let injected: any;
        render(
          <Formik initialValues={InitialValues} onSubmit={noop}>
            {formikProps =>
              (injected = formikProps) && <Form {...formikProps} />
            }
          </Formik>
        );

        const status = 'status';
        injected.setStatus(status);

        expect(injected.status).toEqual(status);
      });
    });
  });
});

describe('<Formik>', () => {
  describe('FormikComputedProps', () => {
    it('should compute dirty as soon as any input is touched', () => {
      const tree = shallow(BasicForm);
      expect(tree.find(Form).props().dirty).toBe(false);
      tree.setState({ values: { name: 'ian' } });
      expect(tree.find(Form).props().dirty).toBe(true);
    });

    it('should compute isValid if isInitialValid is present and returns true', () => {
      const tree = shallow(
        <Formik
          initialValues={{ name: 'jared' }}
          onSubmit={noop}
          component={Form}
          isInitialValid={() => true}
        />
      );
      expect(tree.find(Form).props().dirty).toBe(false);
      expect(tree.find(Form).props().isValid).toBe(true);
    });

    it('should compute isValid if isInitialValid is present and returns false', () => {
      const tree = shallow(
        <Formik
          initialValues={{ name: 'jared' }}
          onSubmit={noop}
          component={Form}
          isInitialValid={() => false}
        />
      );
      expect(tree.find(Form).props().dirty).toBe(false);
      expect(tree.find(Form).props().isValid).toBe(false);
    });

    it('should compute isValid if isInitialValid boolean is present and set to true', () => {
      const tree = shallow(
        <Formik
          initialValues={{ name: 'jared' }}
          onSubmit={noop}
          component={Form}
          isInitialValid={true}
        />
      );
      expect(tree.find(Form).props().dirty).toBe(false);
      expect(tree.find(Form).props().isValid).toBe(true);
    });

    it('should compute isValid if isInitialValid is present and set to false', () => {
      const tree = shallow(
        <Formik
          initialValues={{ name: 'jared' }}
          onSubmit={noop}
          component={Form}
          isInitialValid={false}
        />
      );
      expect(tree.find(Form).props().dirty).toBe(false);
      expect(tree.find(Form).props().isValid).toBe(false);
    });

    it('should compute isValid if the form is dirty and there are errors', () => {
      const tree = shallow(BasicForm);
      tree.setState({ values: { name: 'ian' }, errors: { name: 'Required!' } });
      expect(tree.find(Form).props().dirty).toBe(true);
      expect(tree.find(Form).props().isValid).toBe(false);
    });

    it('should compute isValid if the form is dirty and there are not errors', () => {
      const tree = shallow(BasicForm);
      tree.setState({ values: { name: 'ian' } });
      expect(tree.find(Form).props().dirty).toBe(true);
      expect(tree.find(Form).props().isValid).toBe(true);
    });

    it('should increase submitCount after submitting the form', async () => {
      const tree = shallow(BasicForm);
      expect(tree.find(Form).props().submitCount).toBe(0);
      await tree
        .find(Form)
        .props()
        .submitForm();
      expect(
        tree
          .update()
          .find(Form)
          .props().submitCount
      ).toBe(1);
    });
  });

  describe('componentDidUpdate', () => {
    let form: any, initialValues: any;
    beforeEach(() => {
      initialValues = {
        name: 'formik',
        github: { repoUrl: 'https://github.com/jaredpalmer/formik' },
        watchers: ['ian', 'sam'],
      };
      form = new Formik({
        initialValues,
        onSubmit: jest.fn(),
        enableReinitialize: true,
      });
      form.resetForm = jest.fn();
    });

    it('should not resetForm if new initialValues are the same as previous', () => {
      const newInitialValues = Object.assign({}, initialValues);
      form.componentDidUpdate({
        initialValues: newInitialValues,
        onSubmit: jest.fn(),
      });
      expect(form.resetForm).not.toHaveBeenCalled();
    });

    it('should resetForm if new initialValues are different than previous', () => {
      const newInitialValues = {
        ...initialValues,
        watchers: ['jared', 'ian', 'sam'],
      };
      form.componentDidUpdate({
        initialValues: newInitialValues,
        onSubmit: jest.fn(),
      });
      expect(form.resetForm).toHaveBeenCalled();
    });

    it('should resetForm if new initialValues are deeply different than previous', () => {
      const newInitialValues = {
        ...initialValues,
        github: { repoUrl: 'different' },
      };
      form.componentDidUpdate({
        initialValues: newInitialValues,
        onSubmit: jest.fn(),
      });
      expect(form.resetForm).toHaveBeenCalled();
    });

    it('should NOT resetForm without enableReinitialize flag', () => {
      form = new Formik({
        initialValues,
        onSubmit: jest.fn(),
      });
      form.resetForm = jest.fn();
      const newInitialValues = {
        ...initialValues,
        watchers: ['jared', 'ian', 'sam'],
      };
      form.componentDidUpdate({
        initialValues: newInitialValues,
        onSubmit: jest.fn(),
      });
      expect(form.resetForm).not.toHaveBeenCalled();
    });
  });

  describe('handleReset', () => {
    it('should call onReset with values and actions when form is reset', async () => {
      const onReset = jest.fn();

      const tree = shallow(
        <Formik
          initialValues={{ name: 'jared' }}
          onSubmit={jest.fn()}
          onReset={onReset}
          component={Form}
        />
      );
      await tree
        .find(Form)
        .props()
        .handleReset();

      expect(onReset).toHaveBeenCalledWith(
        { name: 'jared' },
        expect.objectContaining({
          resetForm: expect.any(Function),
          setError: expect.any(Function),
          setErrors: expect.any(Function),
          setFieldError: expect.any(Function),
          setFieldTouched: expect.any(Function),
          setFieldValue: expect.any(Function),
          setStatus: expect.any(Function),
          setSubmitting: expect.any(Function),
          setTouched: expect.any(Function),
          setValues: expect.any(Function),
          submitForm: expect.any(Function),
        })
      );
    });

    it('should not error resetting form if onReset is not a prop', async () => {
      const onSubmit = jest.fn();

      const tree = shallow(
        <Formik
          initialValues={{ name: 'bar' }}
          onSubmit={onSubmit}
          component={Form}
        />
      );
      await tree
        .find(Form)
        .props()
        .handleReset();

      expect(true);
    });

    it('should call onReset with values and actions when onReset is a promise', async () => {
      const onReset = jest.fn(() => Promise.resolve('data'));

      const tree = shallow(
        <Formik
          initialValues={{ name: 'jared' }}
          onSubmit={jest.fn()}
          onReset={onReset}
          component={Form}
        />
      );

      (tree.instance() as any).resetForm = jest.fn();

      await tree
        .find(Form)
        .props()
        .handleReset();

      expect(onReset).toHaveBeenCalledWith(
        { name: 'jared' },
        expect.objectContaining({
          resetForm: expect.any(Function),
          setError: expect.any(Function),
          setErrors: expect.any(Function),
          setFieldError: expect.any(Function),
          setFieldTouched: expect.any(Function),
          setFieldValue: expect.any(Function),
          setStatus: expect.any(Function),
          setSubmitting: expect.any(Function),
          setTouched: expect.any(Function),
          setValues: expect.any(Function),
          submitForm: expect.any(Function),
        })
      );

      expect((tree.instance() as any).resetForm).toHaveBeenCalledWith('data');
    });

    it('should reset dirty flag even if initialValues has changed', async () => {
      const tree = mount(<WithState />);
      expect(tree.find(Form).props().dirty).toEqual(false);

      tree
        .find(Form)
        .find('input')
        .simulate('change', {
          persist: noop,
          target: {
            id: 'name',
            value: 'Ian',
          },
        });

      expect(tree.find(Form).props().dirty).toEqual(true);

      tree.setState({ data: { name: 'Jared' } });

      await tree
        .find(Form)
        .props()
        .handleReset();

      expect(
        tree
          .update()
          .find(Form)
          .props().dirty
      ).toEqual(false);
    });

    it('should reset submitCount', () => {
      const tree = mount(<WithState />);

      tree
        .find(Form)
        .props()
        .handleSubmit();

      expect(
        tree
          .update()
          .find(Form)
          .props().submitCount
      ).toEqual(1);

      tree
        .find(Form)
        .props()
        .handleReset();

      expect(
        tree
          .update()
          .find(Form)
          .props().submitCount
      ).toEqual(0);
    });
  });

  it('should warn against buttons with unspecified type', () => {
    const FormWithNoButtonType = () => (
      <Formik onSubmit={noop} initialValues={{ opensource: 'yay' }}>
        {({ handleSubmit, handleChange, values }) => (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              onChange={handleChange}
              value={values.opensource}
              name="name"
            />
            <button>Submit</button>
          </form>
        )}
      </Formik>
    );
    const tree = mount(<FormWithNoButtonType />);
    const preventDefault = jest.fn();
    const button = tree.find('button').getDOMNode();

    button.focus(); // sets activeElement
    tree.find('form').simulate('submit', {
      preventDefault,
    });
    expect(global.console.error).toHaveBeenCalledWith(
      expect.stringMatching(
        /Warning: You submitted a Formik form using a button with an unspecified `type./
      )
    );

    button.blur(); // unsets activeElement
    (global.console.error as jest.Mock<{}>).mockClear();
  });

  it('should not warn when button has type submit', () => {
    const FormWithValidButtonType = () => (
      <Formik onSubmit={noop} initialValues={{ opensource: 'yay' }}>
        {({ handleSubmit, handleChange, values }) => (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              onChange={handleChange}
              value={values.opensource}
              name="name"
            />
            <button type="submit">Submit</button>
          </form>
        )}
      </Formik>
    );
    const tree = mount(<FormWithValidButtonType />);
    const preventDefault = jest.fn();
    const button = tree.find('button').getDOMNode();

    button.focus(); // sets activeElement
    tree.find('form').simulate('submit', {
      preventDefault,
    });
    expect(global.console.error).not.toHaveBeenCalledWith(
      expect.stringMatching(
        /Warning: You submitted a Formik form using a button with an unspecified type./
      )
    );

    button.blur(); // unsets activeElement
    (global.console.error as jest.Mock<{}>).mockClear();
  });

  it('should not warn when activeElement is not a button', () => {
    const FormWithInput = () => (
      <Formik onSubmit={noop} initialValues={{ opensource: 'yay' }}>
        {({ handleSubmit, handleChange, values }) => (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              onChange={handleChange}
              value={values.opensource}
              name="name"
            />
            <button type="submit">Submit</button>
          </form>
        )}
      </Formik>
    );
    const tree = mount(<FormWithInput />);
    const preventDefault = jest.fn();
    const input = tree.find('input').getDOMNode();

    input.focus(); // sets activeElement
    tree.find('form').simulate('submit', {
      preventDefault,
    });
    expect(global.console.error).not.toHaveBeenCalledWith(
      expect.stringMatching(
        /Warning: You submitted a Formik form using a button with an unspecified type./
      )
    );

    input.blur(); // unsets activeElement
    (global.console.error as jest.Mock<{}>).mockClear();
  });
  it('submit count increments', async () => {
    const node = document.createElement('div');
    const onSubmit = jest.fn();
    let injected: any;
    ReactDOM.render(
      <Formik onSubmit={onSubmit} initialValues={{ opensource: 'yay' }}>
        {formikProps => (injected = formikProps) && null}
      </Formik>,
      node
    );

    expect(injected.submitCount).toEqual(0);
    await injected.submitForm();
    expect(onSubmit).toHaveBeenCalled();
    expect(injected.submitCount).toEqual(1);
  });

  it('isValidating is fired when submit is attempted', async () => {
    const node = document.createElement('div');
    const onSubmit = jest.fn();
    const validate = jest.fn(() => ({ opensource: 'no ' }));
    let injected: any;
    ReactDOM.render(
      <Formik
        onSubmit={onSubmit}
        validate={validate}
        initialValues={{ opensource: 'yay' }}
      >
        {formikProps => (injected = formikProps) && null}
      </Formik>,
      node
    );

    expect(injected.submitCount).toEqual(0);
    expect(injected.isSubmitting).toBe(false);
    expect(injected.isValidating).toBe(false);
    // we call set isValidating synchronously
    const validatePromise = injected.submitForm();
    // so it should change
    expect(injected.isSubmitting).toBe(true);
    expect(injected.isValidating).toBe(true);
    // do it again async
    await validatePromise;
    // now both should be false because validation failed
    expect(injected.isSubmitting).toBe(false);
    expect(injected.isValidating).toBe(false);
    expect(validate).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(injected.submitCount).toEqual(1);
  });

  it('isSubmitting is fired when submit is attempted', async () => {
    const node = document.createElement('div');
    const onSubmit = jest.fn();
    const validate = jest.fn(() => ({}));
    let injected: any;
    ReactDOM.render(
      <Formik
        onSubmit={onSubmit}
        validate={validate}
        initialValues={{ opensource: 'yay' }}
      >
        {formikProps => (injected = formikProps) && null}
      </Formik>,
      node
    );

    expect(injected.submitCount).toEqual(0);
    expect(injected.isSubmitting).toBe(false);
    expect(injected.isValidating).toBe(false);
    // we call set isValidating synchronously
    const validatePromise = injected.submitForm();
    // so it should change
    expect(injected.isSubmitting).toBe(true);
    expect(injected.isValidating).toBe(true);
    // do it again async
    await validatePromise;
    // done validating
    expect(injected.isValidating).toBe(false);
    // now run submit
    expect(injected.isSubmitting).toBe(true);
    expect(validate).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
    expect(injected.submitCount).toEqual(1);
  });

  it('isValidating is fired validation is run', async () => {
    const node = document.createElement('div');
    const validate = jest.fn(() => ({ opensource: 'no' }));
    let injected: any;
    ReactDOM.render(
      <Formik
        onSubmit={noop}
        validate={validate}
        initialValues={{ opensource: 'yay' }}
      >
        {formikProps => (injected = formikProps) && null}
      </Formik>,
      node
    );

    expect(injected.isValidating).toBe(false);
    // we call set isValidating synchronously
    const validatePromise = injected.validateForm();
    expect(injected.isValidating).toBe(true);
    await validatePromise;
    expect(validate).toHaveBeenCalled();
    // so it should change
    expect(injected.isValidating).toBe(false);
  });

  it('should merge validation errors', async () => {
    const validate = () => ({
      users: [{ firstName: 'required' }],
    });
    const validationSchema = Yup.object({
      users: Yup.array().of(
        Yup.object({
          lastName: Yup.string().required('required'),
        })
      ),
    });
    let injected: any;

    const node = document.createElement('div');

    ReactDOM.render(
      <Formik
        initialValues={{ users: [{ firstName: '', lastName: '' }] }}
        validate={validate}
        validationSchema={validationSchema}
        onSubmit={noop}
      >
        {formikProps => (injected = formikProps) && null}
      </Formik>,
      node
    );

    await injected.validateForm();
    expect(injected.errors).toEqual({
      users: [{ firstName: 'required', lastName: 'required' }],
    });
  });
});
