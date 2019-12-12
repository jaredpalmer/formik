import * as React from 'react';
import { render, fireEvent, wait } from 'react-testing-library';
import * as Yup from 'yup';

import {
  Formik,
  prepareDataForValidation,
  FormikProps,
  FormikConfig,
} from '../src';
import { noop } from './testHelpers';

jest.spyOn(global.console, 'warn');

interface Values {
  name: string;
}

function Form({
  values,
  touched,
  handleSubmit,
  handleChange,
  handleBlur,
  status,
  errors,
  isSubmitting,
}: FormikProps<Values>) {
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
      {status && !!status.myStatusMessage && (
        <div id="statusMessage">{status.myStatusMessage}</div>
      )}
      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </form>
  );
}

const InitialValues = { name: 'jared' };

function renderFormik<V = Values>(props?: Partial<FormikConfig<V>>) {
  let injected: any;
  const { rerender, ...rest } = render(
    <Formik
      onSubmit={noop as any}
      initialValues={InitialValues as any}
      {...props}
    >
      {formikProps =>
        (injected = formikProps) && (
          <Form {...((formikProps as unknown) as FormikProps<Values>)} />
        )
      }
    </Formik>
  );
  return {
    getProps(): FormikProps<V> {
      return injected;
    },
    ...rest,
    rerender: () =>
      rerender(
        <Formik
          onSubmit={noop as any}
          initialValues={InitialValues as any}
          {...props}
        >
          {formikProps =>
            (injected = formikProps) && (
              <Form {...((formikProps as unknown) as FormikProps<Values>)} />
            )
          }
        </Formik>
      ),
  };
}

describe('<Formik>', () => {
  it('should initialize Formik state and pass down props', () => {
    const { getProps } = renderFormik();
    const props = getProps();

    expect(props.isSubmitting).toBe(false);
    expect(props.touched).toEqual({});
    expect(props.values).toEqual(InitialValues);
    expect(props.errors).toEqual({});
    expect(props.dirty).toBe(false);
    expect(props.isValid).toBe(true);
    expect(props.submitCount).toBe(0);
  });

  describe('handleChange', () => {
    it('updates values based on name attribute', () => {
      const { getProps, getByTestId } = renderFormik<Values>();

      expect(getProps().values.name).toEqual(InitialValues.name);

      const input = getByTestId('name-input');
      fireEvent.change(input, {
        persist: noop,
        target: {
          name: 'name',
          value: 'ian',
        },
      });

      expect(getProps().values.name).toEqual('ian');
    });

    it('updates values when passed a string (overloaded)', () => {
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

    it('updates values via `name` instead of `id` attribute when both are present', () => {
      const { getProps, getByTestId } = renderFormik<Values>();

      expect(getProps().values.name).toEqual(InitialValues.name);

      const input = getByTestId('name-input');
      fireEvent.change(input, {
        persist: noop,
        target: {
          id: 'person-1-thinger',
          name: 'name',
          value: 'ian',
        },
      });

      expect(getProps().values.name).toEqual('ian');
    });

    it('updates values when passed a string (overloaded)', () => {
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
      const validationSchema = {
        validate,
      };
      const { getByTestId, rerender } = renderFormik({
        validate,
        validationSchema,
      });

      fireEvent.change(getByTestId('name-input'), {
        persist: noop,
        target: {
          name: 'name',
          value: 'ian',
        },
      });
      rerender();
      await wait(() => {
        expect(validate).toHaveBeenCalledTimes(2);
      });
    });

    it('does NOT run validations if validateOnChange is false', async () => {
      const validate = jest.fn(() => Promise.resolve());
      const validationSchema = {
        validate,
      };
      const { getByTestId, rerender } = renderFormik({
        validate,
        validationSchema,
        validateOnChange: false,
      });

      fireEvent.change(getByTestId('name-input'), {
        persist: noop,
        target: {
          name: 'name',
          value: 'ian',
        },
      });
      rerender();
      await wait(() => {
        expect(validate).not.toHaveBeenCalled();
      });
    });
  });

  describe('handleBlur', () => {
    it('sets touched state', () => {
      const { getProps, getByTestId } = renderFormik<Values>();
      expect(getProps().touched.name).toEqual(undefined);

      const input = getByTestId('name-input');
      fireEvent.blur(input, {
        target: {
          name: 'name',
        },
      });
      expect(getProps().touched.name).toEqual(true);
    });

    it('updates touched state via `name` instead of `id` attribute when both are present', () => {
      const { getProps, getByTestId } = renderFormik<Values>();
      expect(getProps().touched.name).toEqual(undefined);

      const input = getByTestId('name-input');
      fireEvent.blur(input, {
        target: {
          id: 'blah',
          name: 'name',
        },
      });
      expect(getProps().touched.name).toEqual(true);
    });

    it('updates touched when passed a string (overloaded)', () => {
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
      const { getByTestId, rerender } = renderFormik({ validate });

      fireEvent.blur(getByTestId('name-input'), {
        target: {
          name: 'name',
        },
      });
      rerender();
      await wait(() => {
        expect(validate).toHaveBeenCalled();
      });
    });

    it('runs validations by default', async () => {
      const validate = jest.fn(() => Promise.resolve());
      const validationSchema = {
        validate,
      };
      const { getByTestId, rerender } = renderFormik({
        validate,
        validationSchema,
      });

      fireEvent.blur(getByTestId('name-input'), {
        target: {
          name: 'name',
        },
      });
      rerender();
      await wait(() => {
        expect(validate).toHaveBeenCalledTimes(2);
      });
    });

    it('runs validations if validateOnBlur is true (default)', async () => {
      const validate = jest.fn(() => Promise.resolve());
      const validationSchema = {
        validate,
      };
      const { getByTestId, rerender } = renderFormik({
        validate,
        validationSchema,
      });

      fireEvent.blur(getByTestId('name-input'), {
        target: {
          name: 'name',
        },
      });
      rerender();
      await wait(() => {
        expect(validate).toHaveBeenCalledTimes(2);
      });
    });

    it('dost NOT run validations if validateOnBlur is false', async () => {
      const validate = jest.fn(() => Promise.resolve());
      const validationSchema = {
        validate,
      };
      const { rerender } = renderFormik({
        validate,
        validationSchema,
        validateOnBlur: false,
      });
      rerender();
      await wait(() => expect(validate).not.toHaveBeenCalled());
    });
  });

  describe('handleSubmit', () => {
    it('should call preventDefault()', () => {
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
      const { getProps, getByTestId } = renderFormik();
      expect(getProps().touched).toEqual({});

      fireEvent.submit(getByTestId('form'));
      expect(getProps().touched).toEqual({ name: true });
    });

    it('should push submission state changes to child component', () => {
      const { getProps, getByTestId } = renderFormik();
      expect(getProps().isSubmitting).toBeFalsy();

      fireEvent.submit(getByTestId('form'));
      expect(getProps().isSubmitting).toBeTruthy();
    });

    describe('with validate (SYNC)', () => {
      it('should call validate if present', () => {
        const validate = jest.fn(() => ({}));
        const { getByTestId } = renderFormik({ validate });
        fireEvent.submit(getByTestId('form'));
        expect(validate).toHaveBeenCalled();
      });

      it('should submit the form if valid', async () => {
        const onSubmit = jest.fn();
        const validate = jest.fn(() => ({}));
        const { getByTestId } = renderFormik({ onSubmit, validate });

        fireEvent.submit(getByTestId('form'));
        await wait(() => expect(onSubmit).toBeCalled());
      });

      it('should not submit the form if invalid', () => {
        const onSubmit = jest.fn();
        const validate = jest.fn(() => ({ name: 'Error!' }));
        const { getByTestId } = renderFormik({ onSubmit, validate });

        fireEvent.submit(getByTestId('form'));
        expect(onSubmit).not.toBeCalled();
      });

      it('should not submit the form if validate function throws an error', async () => {
        const onSubmit = jest.fn();
        const err = new Error('Async Error');
        const validate = jest.fn().mockRejectedValue(err);
        const { getProps } = renderFormik({
          onSubmit,
          validate,
        });

        await expect(getProps().submitForm()).rejects.toThrow('Async Error');

        await wait(() => {
          expect(onSubmit).not.toBeCalled();
          expect(global.console.warn).toHaveBeenCalledWith(
            expect.stringMatching(
              /Warning: An unhandled error was caught during validation in <Formik validate ./
            ),
            err
          );
        });
      });

      describe('submitForm helper should not break promise chain if handleSubmit has returned rejected Promise', () => {
        it('submitForm helper should not break promise chain if handleSubmit has returned rejected Promise', async () => {
          const error = new Error('This Error is typeof Error');
          const handleSubmit = () => {
            return Promise.reject(error);
          };
          const { getProps } = renderFormik({ onSubmit: handleSubmit });

          const { submitForm } = getProps();
          await expect(submitForm()).rejects.toEqual(error);
        });
      });
    });

    describe('with validate (ASYNC)', () => {
      it('should call validate if present', () => {
        const validate = jest.fn(() => Promise.resolve({}));
        const { getByTestId } = renderFormik({ validate });

        fireEvent.submit(getByTestId('form'));
        expect(validate).toHaveBeenCalled();
      });

      it('should submit the form if valid', async () => {
        const onSubmit = jest.fn();
        const validate = jest.fn(() => Promise.resolve({}));
        const { getByTestId } = renderFormik({ onSubmit, validate });

        fireEvent.submit(getByTestId('form'));
        await wait(() => expect(onSubmit).toBeCalled());
      });

      it('should not submit the form if invalid', () => {
        const onSubmit = jest.fn();
        const validate = jest.fn(() => Promise.resolve({ name: 'Error!' }));
        const { getByTestId } = renderFormik({ onSubmit, validate });

        fireEvent.submit(getByTestId('form'));
        expect(onSubmit).not.toBeCalled();
      });

      it('should not submit the form if validate function rejects with an error', async () => {
        const onSubmit = jest.fn();
        const err = new Error('Async Error');
        const validate = jest.fn().mockRejectedValue(err);

        const { getProps } = renderFormik({ onSubmit, validate });

        await expect(getProps().submitForm()).rejects.toThrow('Async Error');

        await wait(() => {
          expect(onSubmit).not.toBeCalled();
          expect(global.console.warn).toHaveBeenCalledWith(
            expect.stringMatching(
              /Warning: An unhandled error was caught during validation in <Formik validate ./
            ),
            err
          );
        });
      });
    });

    describe('with validationSchema (ASYNC)', () => {
      it('should run validationSchema if present', async () => {
        const validate = jest.fn(() => Promise.resolve({}));
        const validationSchema = {
          validate,
        };
        const { getByTestId } = renderFormik({
          validate,
          validationSchema,
        });

        fireEvent.submit(getByTestId('form'));
        expect(validate).toHaveBeenCalled();
      });

      it('should call validationSchema if it is a function and present', async () => {
        const validate = jest.fn(() => Promise.resolve({}));
        const validationSchema = () => ({
          validate,
        });
        const { getByTestId } = renderFormik({
          validate,
          validationSchema,
        });

        fireEvent.submit(getByTestId('form'));
        expect(validate).toHaveBeenCalled();
      });
    });

    describe('FormikHelpers', () => {
      it('setValues sets values', () => {
        const { getProps } = renderFormik<Values>();

        getProps().setValues({ name: 'ian' });
        expect(getProps().values.name).toEqual('ian');
      });

      it('setValues should run validations when validateOnChange is true (default)', async () => {
        const newValue: Values = { name: 'ian' };
        const validate = jest.fn(_values => ({}));
        // const { getProps, rerender } = renderFormik({ validate });
        const { getProps } = renderFormik({ validate });

        getProps().setValues(newValue);
        // rerender();
        await wait(() => {
          expect(validate).toHaveBeenCalledWith(newValue, undefined);
        });
      });
      it('setValues should NOT run validations when validateOnChange is false', async () => {
        const validate = jest.fn();
        const { getProps, rerender } = renderFormik<Values>({
          validate,
          validateOnChange: false,
        });

        getProps().setValues({ name: 'ian' });
        rerender();
        await wait(() => {
          expect(validate).not.toHaveBeenCalled();
        });
      });

      it('setFieldValue sets value by key', async () => {
        const { getProps, rerender } = renderFormik<Values>();

        getProps().setFieldValue('name', 'ian');
        rerender();
        await wait(() => {
          expect(getProps().values.name).toEqual('ian');
        });
      });

      it('setFieldValue should run validations when validateOnChange is true (default)', async () => {
        const validate = jest.fn(() => ({}));
        const { getProps, rerender } = renderFormik({ validate });

        getProps().setFieldValue('name', 'ian');
        rerender();
        await wait(() => {
          expect(validate).toHaveBeenCalled();
        });
      });

      it('setFieldValue should NOT run validations when validateOnChange is false', async () => {
        const validate = jest.fn();
        const { getProps, rerender } = renderFormik({
          validate,
          validateOnChange: false,
        });

        getProps().setFieldValue('name', 'ian');
        rerender();
        await wait(() => {
          expect(validate).not.toHaveBeenCalled();
        });
      });

      it('setTouched sets touched', () => {
        const { getProps } = renderFormik();

        getProps().setTouched({ name: true });
        expect(getProps().touched).toEqual({ name: true });
      });

      it('setTouched should NOT run validations when validateOnChange is true (default)', async () => {
        const validate = jest.fn(() => ({}));
        const { getProps, rerender } = renderFormik({ validate });

        getProps().setTouched({ name: true });
        rerender();
        await wait(() => expect(validate).toHaveBeenCalled());
      });

      it('setTouched should run validations when validateOnBlur is false', async () => {
        const validate = jest.fn(() => ({}));
        const { getProps, rerender } = renderFormik({
          validate,
          validateOnBlur: false,
        });

        getProps().setTouched({ name: true });
        rerender();
        await wait(() => expect(validate).not.toHaveBeenCalled());
      });

      it('setFieldTouched sets touched by key', () => {
        const { getProps } = renderFormik<Values>();

        getProps().setFieldTouched('name', true);
        expect(getProps().touched).toEqual({ name: true });
        expect(getProps().dirty).toBe(false);

        getProps().setFieldTouched('name', false);
        expect(getProps().touched).toEqual({ name: false });
        expect(getProps().dirty).toBe(false);
      });

      it('setFieldTouched should run validations when validateOnBlur is true (default)', async () => {
        const validate = jest.fn(() => ({}));
        const { getProps, rerender } = renderFormik({ validate });

        getProps().setFieldTouched('name', true);
        rerender();
        await wait(() => expect(validate).toHaveBeenCalled());
      });

      it('setFieldTouched should NOT run validations when validateOnBlur is false', async () => {
        const validate = jest.fn(() => ({}));
        const { getProps, rerender } = renderFormik({
          validate,
          validateOnBlur: false,
        });

        getProps().setFieldTouched('name', true);
        rerender();
        await wait(() => expect(validate).not.toHaveBeenCalled());
      });

      it('setErrors sets error object', () => {
        const { getProps } = renderFormik<Values>();

        getProps().setErrors({ name: 'Required' });
        expect(getProps().errors.name).toEqual('Required');
      });

      it('setFieldError sets error by key', () => {
        const { getProps } = renderFormik<Values>();

        getProps().setFieldError('name', 'Required');
        expect(getProps().errors.name).toEqual('Required');
      });

      it('setStatus sets status object', () => {
        const { getProps } = renderFormik();

        const status = 'status';
        getProps().setStatus(status);

        expect(getProps().status).toEqual(status);
      });
    });
  });

  describe('FormikComputedProps', () => {
    it('should compute dirty as soon as any input is touched', () => {
      const { getProps } = renderFormik();

      expect(getProps().dirty).toBeFalsy();
      getProps().setValues({ name: 'ian' });
      expect(getProps().dirty).toBeTruthy();
    });

    it('should compute isValid if isInitialValid is present and returns true', () => {
      const { getProps } = renderFormik({ isInitialValid: () => true });

      expect(getProps().dirty).toBeFalsy();
      expect(getProps().isValid).toBeTruthy();
    });

    it('should compute isValid if isInitialValid is present and returns false', () => {
      const { getProps } = renderFormik({ isInitialValid: () => false });

      expect(getProps().dirty).toBeFalsy();
      expect(getProps().isValid).toBeFalsy();
    });

    it('should compute isValid if isInitialValid boolean is present and set to true', () => {
      const { getProps } = renderFormik({ isInitialValid: true });

      expect(getProps().dirty).toBeFalsy();
      expect(getProps().isValid).toBeTruthy();
    });

    it('should compute isValid if isInitialValid is present and set to false', () => {
      const { getProps } = renderFormik({ isInitialValid: false });

      expect(getProps().dirty).toBeFalsy();
      expect(getProps().isValid).toBeFalsy();
    });

    it('should compute isValid if the form is dirty and there are errors', () => {
      const { getProps } = renderFormik();

      getProps().setValues({ name: 'ian' });
      getProps().setErrors({ name: 'Required!' });

      expect(getProps().dirty).toBeTruthy();
      expect(getProps().isValid).toBeFalsy();
    });

    it('should compute isValid if the form is dirty and there are not errors', () => {
      const { getProps } = renderFormik();

      getProps().setValues({ name: 'ian' });

      expect(getProps().dirty).toBeTruthy();
      expect(getProps().isValid).toBeTruthy();
    });

    it('should increase submitCount after submitting the form', () => {
      const { getProps, getByTestId } = renderFormik();

      expect(getProps().submitCount).toBe(0);
      fireEvent.submit(getByTestId('form'));
      expect(getProps().submitCount).toBe(1);
    });
  });

  describe('handleReset', () => {
    it('should call onReset with values and actions when form is reset', () => {
      const onReset = jest.fn();
      const { getProps } = renderFormik({
        initialValues: InitialValues,
        onSubmit: noop,
        onReset,
      });

      getProps().handleReset();

      expect(onReset).toHaveBeenCalledWith(
        { name: 'jared' },
        expect.objectContaining({
          resetForm: expect.any(Function),
          setErrors: expect.any(Function),
          setFieldError: expect.any(Function),
          setFieldTouched: expect.any(Function),
          setFieldValue: expect.any(Function),
          setStatus: expect.any(Function),
          setSubmitting: expect.any(Function),
          setTouched: expect.any(Function),
          setValues: expect.any(Function),
        })
      );
    });

    it('should not error resetting form if onReset is not a prop', () => {
      const { getProps } = renderFormik();
      getProps().handleReset();
      expect(true);
    });

    // it('should call onReset with values and actions when onReset is a promise', async () => {
    //   const ref = React.createRef<Formik>();
    //   const onReset = jest.fn(() => Promise.resolve('data'));

    //   const { getProps } = renderFormik({
    //     ref,
    //     onReset,
    //   });

    //   ref.current!.resetForm = jest.fn();

    //   getProps().handleReset();

    //   await wait(() =>
    //     expect(ref.current!.resetForm).toHaveBeenCalledWith('data')
    //   );
    // });

    it('should reset dirty flag even if initialValues has changed', () => {
      const { getProps, getByTestId } = renderFormik();

      expect(getProps().dirty).toBeFalsy();

      const input = getByTestId('name-input');
      fireEvent.change(input, {
        persist: noop,
        target: {
          name: 'name',
          value: 'Pavel',
        },
      });
      expect(getProps().dirty).toBeTruthy();

      getProps().handleReset();
      expect(getProps().dirty).toBeFalsy();
    });

    it('should reset submitCount', () => {
      const { getProps } = renderFormik();

      getProps().handleSubmit();
      expect(getProps().submitCount).toEqual(1);

      getProps().handleReset();
      expect(getProps().submitCount).toEqual(0);
    });
  });

  describe('resetForm', () => {
    it('should reset dirty when reseting to same values', () => {
      const { getProps } = renderFormik();
      expect(getProps().dirty).toBe(false);

      getProps().setFieldValue('name', 'jared-next');
      expect(getProps().dirty).toBe(true);

      getProps().resetForm({ values: getProps().values });
      expect(getProps().dirty).toBe(false);
    });
  });

  describe('prepareDataForValidation', () => {
    it('should work correctly with instances', () => {
      class SomeClass {}
      const expected = {
        string: 'string',
        date: new Date(),
        someInstance: new SomeClass(),
      };

      const dataForValidation = prepareDataForValidation(expected);
      expect(dataForValidation).toEqual(expected);
    });

    it('should work correctly with instances in arrays', () => {
      class SomeClass {}
      const expected = {
        string: 'string',
        dateArr: [new Date(), new Date()],
        someInstanceArr: [new SomeClass(), new SomeClass()],
      };

      const dataForValidation = prepareDataForValidation(expected);
      expect(dataForValidation).toEqual(expected);
    });

    it('should work correctly with instances in objects', () => {
      class SomeClass {}
      const expected = {
        string: 'string',
        object: {
          date: new Date(),
          someInstance: new SomeClass(),
        },
      };

      const dataForValidation = prepareDataForValidation(expected);
      expect(dataForValidation).toEqual(expected);
    });

    it('should work correctly with mixed data', () => {
      const date = new Date();
      const dataForValidation = prepareDataForValidation({
        string: 'string',
        empty: '',
        arr: [],
        date,
      });
      expect(dataForValidation).toEqual({
        string: 'string',
        empty: undefined,
        arr: [],
        date,
      });
    });
  });

  // describe('componentDidUpdate', () => {
  //   let formik: any, initialValues: any;
  //   beforeEach(() => {
  //     initialValues = {
  //       name: 'formik',
  //       github: { repoUrl: 'https://github.com/jaredpalmer/formik' },
  //       watchers: ['ian', 'sam'],
  //     };

  //     const { getRef } = renderFormik({
  //       initialValues,
  //       enableReinitialize: true,
  //     });
  //     formik = getRef();
  //     formik.current.resetForm = jest.fn();
  //   });

  //   it('should not resetForm if new initialValues are the same as previous', () => {
  //     const newInitialValues = Object.assign({}, initialValues);
  //     formik.current.componentDidUpdate({
  //       initialValues: newInitialValues,
  //       onSubmit: noop,
  //     });
  //     expect(formik.current.resetForm).not.toHaveBeenCalled();
  //   });

  //   it('should resetForm if new initialValues are different than previous', () => {
  //     const newInitialValues = {
  //       ...initialValues,
  //       watchers: ['jared', 'ian', 'sam'],
  //     };
  //     formik.current.componentDidUpdate({
  //       initialValues: newInitialValues,
  //       onSubmit: noop,
  //     });
  //     expect(formik.current.resetForm).toHaveBeenCalled();
  //   });

  //   it('should resetForm if new initialValues are deeply different than previous', () => {
  //     const newInitialValues = {
  //       ...initialValues,
  //       github: { repoUrl: 'different' },
  //     };
  //     formik.current.componentDidUpdate({
  //       initialValues: newInitialValues,
  //       onSubmit: noop,
  //     });
  //     expect(formik.current.resetForm).toHaveBeenCalled();
  //   });

  //   it('should NOT resetForm without enableReinitialize flag', () => {
  //     const { getRef } = renderFormik({
  //       initialValues,
  //     });
  //     formik = getRef();
  //     formik.current.resetForm = jest.fn();

  //     const newInitialValues = {
  //       ...initialValues,
  //       watchers: ['jared', 'ian', 'sam'],
  //     };
  //     formik.current.componentDidUpdate({
  //       initialValues: newInitialValues,
  //       onSubmit: noop,
  //     });
  //     expect(formik.current.resetForm).not.toHaveBeenCalled();
  //   });
  // });

  it('should warn against buttons with unspecified type', () => {
    const { getByText, getByTestId } = render(
      <Formik onSubmit={noop} initialValues={{ opensource: 'yay' }}>
        {({ handleSubmit, handleChange, values }) => (
          <form onSubmit={handleSubmit} data-testid="form">
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

    const button = getByText('Submit');
    button.focus(); // sets activeElement

    fireEvent.submit(getByTestId('form'));

    expect(global.console.warn).toHaveBeenCalledWith(
      expect.stringMatching(
        /Warning: You submitted a Formik form using a button with an unspecified `type./
      )
    );

    button.blur(); // unsets activeElement
    (global.console.warn as jest.Mock<{}>).mockClear();
  });

  it('should not warn when button has type submit', () => {
    const { getByText, getByTestId } = render(
      <Formik onSubmit={noop} initialValues={{ opensource: 'yay' }}>
        {({ handleSubmit, handleChange, values }) => (
          <form onSubmit={handleSubmit} data-testid="form">
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

    const button = getByText('Submit');
    button.focus(); // sets activeElement

    fireEvent.submit(getByTestId('form'));

    expect(global.console.warn).not.toHaveBeenCalledWith(
      expect.stringMatching(
        /Warning: You submitted a Formik form using a button with an unspecified type./
      )
    );

    button.blur(); // unsets activeElement
    (global.console.warn as jest.Mock<{}>).mockClear();
  });

  it('should not warn when activeElement is not a button', () => {
    const { getByTestId } = render(
      <Formik onSubmit={noop} initialValues={{ opensource: 'yay' }}>
        {({ handleSubmit, handleChange, values }) => (
          <form onSubmit={handleSubmit} data-testid="form">
            <input
              type="text"
              onChange={handleChange}
              value={values.opensource}
              name="name"
              data-testid="name-input"
            />
            <button type="submit">Submit</button>
          </form>
        )}
      </Formik>
    );
    const input = getByTestId('name-input');
    input.focus(); // sets activeElement

    fireEvent.submit(getByTestId('form'));

    expect(global.console.warn).not.toHaveBeenCalledWith(
      expect.stringMatching(
        /Warning: You submitted a Formik form using a button with an unspecified type./
      )
    );

    input.blur(); // unsets activeElement
    (global.console.warn as jest.Mock<{}>).mockClear();
  });

  it('submit count increments', async () => {
    const onSubmit = jest.fn();

    const { getProps } = renderFormik({
      onSubmit,
    });

    expect(getProps().submitCount).toEqual(0);
    await getProps().submitForm();
    expect(onSubmit).toHaveBeenCalled();
    expect(getProps().submitCount).toEqual(1);
  });

  it('isValidating is fired when submit is attempted', async () => {
    const onSubmit = jest.fn();
    const validate = jest.fn(() => ({
      name: 'no',
    }));

    const { getProps } = renderFormik({
      onSubmit,
      validate,
    });

    expect(getProps().submitCount).toEqual(0);
    expect(getProps().isSubmitting).toBe(false);
    expect(getProps().isValidating).toBe(false);
    // we call set isValidating synchronously
    const validatePromise = getProps().submitForm();
    // so it should change
    expect(getProps().isSubmitting).toBe(true);
    expect(getProps().isValidating).toBe(true);
    // do it again async
    try {
      await validatePromise;
    } catch (err) {}
    // now both should be false because validation failed
    expect(getProps().isSubmitting).toBe(false);
    expect(getProps().isValidating).toBe(false);
    expect(validate).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(getProps().submitCount).toEqual(1);
  });

  it('isSubmitting is fired when submit is attempted (v1)', async () => {
    const onSubmit = jest.fn();
    const validate = jest.fn(() => Promise.resolve({}));

    const { getProps } = renderFormik({
      onSubmit,
      validate,
    });

    expect(getProps().submitCount).toEqual(0);
    expect(getProps().isSubmitting).toBe(false);
    expect(getProps().isValidating).toBe(false);
    // we call set isValidating synchronously
    const validatePromise = getProps().submitForm();
    // so it should change
    expect(getProps().isSubmitting).toBe(true);
    expect(getProps().isValidating).toBe(true);
    // do it again async
    await validatePromise;
    // done validating and submitting
    expect(getProps().isSubmitting).toBe(true);
    expect(getProps().isValidating).toBe(false);
    expect(validate).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
    expect(getProps().submitCount).toEqual(1);
  });

  it('isSubmitting is fired when submit is attempted (v2, promise)', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const validate = jest.fn(() => Promise.resolve({}));

    const { getProps } = renderFormik({
      onSubmit,
      validate,
    });

    expect(getProps().submitCount).toEqual(0);
    expect(getProps().isSubmitting).toBe(false);
    expect(getProps().isValidating).toBe(false);
    // we call set isValidating synchronously
    const validatePromise = getProps().submitForm();
    // so it should change
    expect(getProps().isSubmitting).toBe(true);
    expect(getProps().isValidating).toBe(true);
    // do it again async
    await validatePromise;
    // done validating and submitting
    expect(getProps().isSubmitting).toBe(false);
    expect(getProps().isValidating).toBe(false);
    expect(validate).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
    expect(getProps().submitCount).toEqual(1);
  });

  it('isValidating is fired validation is run', async () => {
    const validate = jest.fn(() => ({ name: 'no' }));
    const { getProps } = renderFormik({
      validate,
    });

    expect(getProps().isValidating).toBe(false);
    // we call set isValidating synchronously
    const validatePromise = getProps().validateForm();
    expect(getProps().isValidating).toBe(true);
    await validatePromise;
    expect(validate).toHaveBeenCalled();
    // so it should change
    expect(getProps().isValidating).toBe(false);
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

    const { getProps } = renderFormik({
      initialValues: { users: [{ firstName: '', lastName: '' }] },
      validate,
      validationSchema,
    });

    await getProps().validateForm();
    expect(getProps().errors).toEqual({
      users: [{ firstName: 'required', lastName: 'required' }],
    });
  });

  it('should not eat an error thrown by the validationSchema', async () => {
    const validationSchema = function() {
      throw new Error('broken validations');
    };

    const { getProps } = renderFormik({
      initialValues: { users: [{ firstName: '', lastName: '' }] },
      validationSchema,
    });

    expect(() => {
      getProps().validateForm();
    }).toThrow('broken validations');
  });
});
