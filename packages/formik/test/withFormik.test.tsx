import * as React from 'react';
import { render, wait } from 'react-testing-library';
import * as Yup from 'yup';

import { withFormik, FormikProps } from '../src';
import { noop } from './testHelpers';

interface Values {
  name: string;
}

const Form: React.SFC<FormikProps<Values>> = ({
  values,
  handleSubmit,
  handleChange,
  handleBlur,
  touched,
  setStatus,
  status,
  errors,
  isSubmitting,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.name}
        name="name"
      />
      {touched.name && errors.name && <div id="feedback">{errors.name}</div>}
      {isSubmitting && <div id="submitting">Submitting</div>}
      <button
        id="statusButton"
        type="button"
        onClick={() => setStatus({ myStatusMessage: 'True' })}
      >
        Call setStatus
      </button>
      {status && !!status.myStatusMessage && (
        <div id="statusMessage">{status.myStatusMessage}</div>
      )}
      <button type="submit">Submit</button>
    </form>
  );
};

const InitialValues: Values = { name: 'jared' };

const renderWithFormik = (options?: any, props?: any) => {
  let injected: any;

  const FormikForm = withFormik<{}, Values>({
    mapPropsToValues: () => InitialValues,
    handleSubmit: noop,
    ...options,
  })(props => (injected = props) && <Form {...props} />);

  return {
    getProps() {
      return injected;
    },
    ...render(<FormikForm {...props} />),
  };
};

describe('withFormik()', () => {
  it('should initialize Formik state and pass down props', () => {
    const { getProps } = renderWithFormik();

    const props = getProps();

    expect(props).toEqual({
      initialValues: {
        name: 'jared',
      },
      initialErrors: {},
      initialTouched: {},
      values: {
        name: InitialValues.name,
      },
      dirty: false,
      errors: {},
      handleBlur: expect.any(Function),
      handleChange: expect.any(Function),
      handleReset: expect.any(Function),
      handleSubmit: expect.any(Function),
      isSubmitting: false,
      isValid: true,
      isValidating: false,
      getFieldProps: expect.any(Function),
      getFieldMeta: expect.any(Function),
      registerField: expect.any(Function),
      resetForm: expect.any(Function),
      setErrors: expect.any(Function),
      setFieldError: expect.any(Function),
      setFieldTouched: expect.any(Function),
      setFieldValue: expect.any(Function),
      setFormikState: expect.any(Function),
      setStatus: expect.any(Function),
      setSubmitting: expect.any(Function),
      setTouched: expect.any(Function),
      setValues: expect.any(Function),
      submitCount: 0,
      submitForm: expect.any(Function),
      touched: {},
      unregisterField: expect.any(Function),
      validateField: expect.any(Function),
      validateForm: expect.any(Function),
      validateOnBlur: true,
      validateOnMount: false,
      validateOnChange: true,
    });
  });

  it('should render child element', () => {
    const { container } = renderWithFormik();
    expect(container.firstChild).toBeDefined();
  });

  it('calls validate with values and props', async () => {
    const validate = jest.fn();
    const myProps = { my: 'prop' };
    const { getProps } = renderWithFormik({ validate }, myProps);

    getProps().submitForm();
    await wait(() =>
      expect(validate).toHaveBeenCalledWith({ name: 'jared' }, myProps)
    );
  });

  it('calls validationSchema', async () => {
    const validate = jest.fn(() => Promise.resolve());
    const { getProps } = renderWithFormik({
      validationSchema: { validate },
    });

    getProps().submitForm();
    await wait(() => expect(validate).toHaveBeenCalled());
  });

  it('calls validationSchema function with props', async () => {
    const validationSchema = jest.fn(() => Yup.object());
    const myProps = { my: 'prop' };
    const { getProps } = renderWithFormik(
      {
        validationSchema,
      },
      myProps
    );

    getProps().submitForm();
    await wait(() => expect(validationSchema).toHaveBeenCalledWith(myProps));
  });

  it('calls handleSubmit with values, actions and custom props', async () => {
    const handleSubmit = jest.fn();
    const myProps = { my: 'prop' };
    const { getProps } = renderWithFormik(
      {
        handleSubmit,
      },
      myProps
    );

    getProps().submitForm();

    await wait(() =>
      expect(handleSubmit).toHaveBeenCalledWith(
        { name: 'jared' },
        {
          props: myProps,
          resetForm: expect.any(Function),
          setErrors: expect.any(Function),
          setFieldError: expect.any(Function),
          setFieldTouched: expect.any(Function),
          setFieldValue: expect.any(Function),
          setFormikState: expect.any(Function),
          setStatus: expect.any(Function),
          setSubmitting: expect.any(Function),
          setTouched: expect.any(Function),
          setValues: expect.any(Function),
          validateField: expect.any(Function),
          validateForm: expect.any(Function),
        }
      )
    );
  });

  it('passes down custom props', () => {
    const { getProps } = renderWithFormik({}, { my: 'prop' });
    expect(getProps().my).toEqual('prop');
  });

  // no ref, WONTFIX?
  // it('should correctly set displayName', () => {
  //   const tree = mount(<BasicForm user={{ name: 'jared' }} />);
  //   expect((tree.get(0).type as any).displayName).toBe('WithFormik(Form)');
  // });
});
