import * as React from 'react';

import { Formik, FormikProps } from '../src/formik';
import { shallow, mount } from 'enzyme';
import { sleep, noop } from './testHelpers';

interface Values {
  name: string;
}

const Form: React.SFC<FormikProps<Values>> = ({
  values,
  handleReset,
  handleSubmit,
  handleChange,
  handleBlur,
  status,
  errors,
  dirty,
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
      {errors.name && <div id="feedback">{errors.name}</div>}
      {isSubmitting && <div id="submitting">Submitting</div>}
      {status &&
        !!status.myStatusMessage && (
          <div id="statusMessage">{status.myStatusMessage}</div>
        )}
      <button type="submit">Submit</button>
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

describe('<Formik>', () => {
  it('should initialize Formik state and pass down props', () => {
    const tree = shallow(BasicForm);
    expect(tree.find(Form).props().isSubmitting).toBe(false);
    expect(tree.find(Form).props().touched).toEqual({});
    expect(tree.find(Form).props().values).toEqual({ name: 'jared' });
    expect(tree.find(Form).props().errors).toEqual({});
    expect(tree.find(Form).props().dirty).toBe(false);
    expect(tree.find(Form).props().isValid).toBe(false);
  });

  describe('FormikHandlers', () => {
    describe('handleChange', () => {
      it('sets values state', async () => {
        const tree = shallow(BasicForm);

        // Simulate a change event in the inner Form component's input
        tree
          .find(Form)
          .dive()
          .find('input')
          .simulate('change', {
            persist: noop,
            target: {
              id: 'name',
              value: 'ian',
            },
          });

        expect(tree.update().state().values).toEqual({ name: 'ian' });
        expect(
          tree
            .update()
            .find(Form)
            .dive()
            .find('input')
            .props().value
        ).toEqual('ian');
      });

      it('updates values state via `name` instead of `id` attribute when both are present', async () => {
        const tree = shallow(BasicForm);

        // Simulate a change event in the inner Form component's input
        tree
          .find(Form)
          .dive()
          .find('input')
          .simulate('change', {
            persist: noop,
            target: {
              id: 'person-1-thinger',
              name: 'name',
              value: 'ian',
            },
          });

        expect(tree.update().state().values).toEqual({ name: 'ian' });
        expect(
          tree
            .update()
            .find(Form)
            .dive()
            .find('input')
            .props().value
        ).toEqual('ian');
      });

      it('runs validations if validateOnChange is set to true', async () => {
        const validate = jest.fn(noop);
        const tree = shallow(
          <Formik
            initialValues={{ name: 'jared' }}
            onSubmit={noop}
            component={Form}
            validate={validate}
            validateOnChange={true}
          />
        );
        tree
          .find(Form)
          .dive()
          .find('input')
          .simulate('change', {
            persist: noop,
            target: {
              name: 'name',
              value: 'ian',
            },
          });
        expect(validate).toHaveBeenCalled();
      });

      it('does NOT run validations if validateOnChange is set to false', async () => {
        const validate = jest.fn(noop);

        const tree = shallow(
          <Formik
            initialValues={{ name: 'jared' }}
            onSubmit={noop}
            component={Form}
            validate={validate}
            validateOnChange={false}
          />
        );
        tree
          .find(Form)
          .dive()
          .find('input')
          .simulate('change', {
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
      it('sets touched state', () => {
        const tree = shallow(BasicForm);

        // Simulate a blur event in the inner Form component's input
        tree
          .find(Form)
          .dive()
          .find('input')
          .simulate('blur', {
            persist: noop,
            target: {
              id: 'name',
            },
          });
        expect(tree.update().state().touched).toEqual({ name: true });
      });

      it('updates touched state via `name` instead of `id` attribute when both are present', () => {
        const tree = shallow(BasicForm);

        // Simulate a blur event in the inner Form component's input
        tree
          .find(Form)
          .dive()
          .find('input')
          .simulate('blur', {
            persist: noop,
            target: {
              id: 'person-1-name-blah',
              name: 'name',
            },
          });
        expect(tree.update().state().touched).toEqual({ name: true });
      });

      it('runs validations if validateOnBlur is set to true ', async () => {
        const validate = jest.fn(noop);

        const tree = shallow(
          <Formik
            initialValues={{ name: 'jared' }}
            onSubmit={noop}
            component={Form}
            validate={validate}
            validateOnBlur={true}
          />
        );

        tree
          .find(Form)
          .dive()
          .find('input')
          .simulate('blur', {
            persist: noop,
            target: {
              name: 'name',
            },
          });
        expect(validate).toHaveBeenCalledTimes(1);
      });
    });

    describe('handleSubmit', () => {
      it('should call preventDefault()', () => {
        const tree = shallow(BasicForm);
        const preventDefault = jest.fn();
        tree
          .find(Form)
          .dive()
          .find('form')
          .simulate('submit', {
            preventDefault,
          });
        expect(preventDefault).toHaveBeenCalled();
      });

      it('should touch all fields', () => {
        const tree = shallow(BasicForm);
        tree
          .find(Form)
          .dive()
          .find('form')
          .simulate('submit', {
            preventDefault: noop,
          });
        expect(tree.update().state().touched).toEqual({ name: true });
      });

      it('should push submission state changes to child component', () => {
        const tree = shallow(BasicForm);

        expect(
          tree
            .find(Form)
            .dive()
            .find('#submitting')
        ).toHaveLength(0);

        tree
          .find(Form)
          .dive()
          .find('form')
          .simulate('submit', {
            preventDefault: noop,
          });

        expect(
          tree
            .update()
            .find(Form)
            .dive()
            .find('#submitting')
        ).toHaveLength(1);
      });

      describe('with validate (SYNC)', () => {
        it('should call validate if present', () => {
          const validate = jest.fn().mockReturnValue({});
          const tree = shallow(
            <Formik
              initialValues={{ name: 'jared' }}
              onSubmit={noop}
              component={Form}
              validate={validate}
            />
          );
          tree
            .find(Form)
            .dive()
            .find('form')
            .simulate('submit', {
              preventDefault: noop,
            });
          expect(validate).toHaveBeenCalled();
        });

        it('should submit the form if valid', () => {
          const onSubmit = jest.fn();
          const tree = shallow(
            <Formik
              initialValues={{ name: 'jared' }}
              onSubmit={onSubmit}
              component={Form}
              validate={noop}
            />
          );
          tree
            .find(Form)
            .dive()
            .find('form')
            .simulate('submit', {
              preventDefault: noop,
            });
          expect(onSubmit).toHaveBeenCalled();
        });

        it('should not submit the form if invalid', () => {
          const validate = jest.fn().mockReturnValue({ name: 'Error!' });
          const onSubmit = jest.fn();

          const tree = shallow(
            <Formik
              initialValues={{ name: 'jared' }}
              onSubmit={onSubmit}
              component={Form}
              validate={validate}
            />
          );
          tree
            .find(Form)
            .dive()
            .find('form')
            .simulate('submit', {
              preventDefault: noop,
            });
          expect(validate).toHaveBeenCalled();
          expect(onSubmit).not.toHaveBeenCalled();
        });
      });

      describe('with validate (ASYNC)', () => {
        it('should call validate if present', () => {
          const validate = jest.fn(() => Promise.resolve({}));

          const tree = shallow(
            <Formik
              initialValues={{ name: 'jared' }}
              onSubmit={noop}
              component={Form}
              validate={validate}
            />
          );
          tree
            .find(Form)
            .dive()
            .find('form')
            .simulate('submit', {
              preventDefault: noop,
            });
          expect(validate).toHaveBeenCalled();
        });

        it('should submit the form if valid', async () => {
          const onSubmit = jest.fn();

          const tree = shallow(
            <Formik
              initialValues={{ name: 'jared' }}
              onSubmit={onSubmit}
              component={Form}
              validate={() => Promise.resolve({})}
            />
          );
          await tree
            .find(Form)
            .props()
            .submitForm();

          expect(onSubmit).toHaveBeenCalled();
        });

        it('should not submit the form if invalid', async () => {
          const onSubmit = jest.fn();

          const tree = shallow(
            <Formik
              initialValues={{ name: 'jared' }}
              onSubmit={onSubmit}
              component={Form}
              validate={() =>
                sleep(25).then(() => {
                  throw { name: 'error!' };
                })
              }
            />
          );
          await tree
            .find(Form)
            .props()
            .submitForm();

          expect(onSubmit).not.toHaveBeenCalled();
        });
      });

      describe('with validationSchema (ASYNC)', () => {
        it('should run validationSchema if present', () => {
          const validate = jest.fn(() => Promise.resolve({}));
          const tree = shallow(
            <Formik
              initialValues={{ name: 'jared' }}
              onSubmit={noop}
              component={Form}
              validate={validate}
              validationSchema={{
                validate,
              }}
            />
          );
          tree
            .find(Form)
            .dive()
            .find('form')
            .simulate('submit', {
              preventDefault: noop,
            });
          expect(validate).toHaveBeenCalled();
        });

        it('should call validationSchema if it is a function and present', () => {
          const validate = jest.fn(() => Promise.resolve({}));
          const tree = shallow(
            <Formik
              initialValues={{ name: 'jared' }}
              onSubmit={noop}
              component={Form}
              validate={validate}
              validationSchema={() => ({
                validate,
              })}
            />
          );
          tree
            .find(Form)
            .dive()
            .find('form')
            .simulate('submit', {
              preventDefault: noop,
            });
          expect(validate).toHaveBeenCalled();
        });
      });
    });
  });

  describe('FormikActions', () => {
    it('setValues sets values', async () => {
      const tree = shallow(BasicForm);
      tree
        .find(Form)
        .props()
        .setValues({ name: 'ian' });
      expect(
        tree
          .update()
          .find(Form)
          .props().values.name
      ).toEqual('ian');
    });

    it('setValues should run validations when validateOnChange is true', async () => {
      const validate = jest.fn().mockReturnValue({});
      const tree = shallow(
        <Formik
          initialValues={{ name: 'jared' }}
          onSubmit={noop}
          component={Form}
          validate={validate}
          validateOnChange={true}
        />
      );
      tree
        .find(Form)
        .props()
        .setValues({ name: 'ian' });
      expect(validate).toHaveBeenCalled();
    });

    it('setValues should NOT run validations when validateOnChange is false', () => {
      const validate = jest.fn();
      const tree = shallow(
        <Formik
          initialValues={{ name: 'jared' }}
          onSubmit={noop}
          component={Form}
          validate={validate}
          validateOnChange={false}
        />
      );
      tree
        .find(Form)
        .props()
        .setValues({ name: 'ian' });
      expect(validate).not.toHaveBeenCalled();
    });

    it('setFieldValue sets value by key', () => {
      const tree = shallow(BasicForm);
      tree
        .find(Form)
        .props()
        .setFieldValue('name', 'ian');
      expect(
        tree
          .update()
          .find(Form)
          .props().values.name
      ).toEqual('ian');
    });

    it('setFieldValue should run validations when validateOnChange is true', () => {
      const validate = jest.fn().mockReturnValue({});

      const tree = shallow(
        <Formik
          initialValues={{ name: 'jared' }}
          onSubmit={noop}
          component={Form}
          validate={validate}
          validateOnChange={true}
        />
      );
      tree
        .find(Form)
        .props()
        .setFieldValue('name', 'ian');
      expect(validate).toHaveBeenCalled();
    });

    it('setFieldValue should NOT run validations when validateOnChange is false', () => {
      const validate = jest.fn();

      const tree = shallow(
        <Formik
          initialValues={{ name: 'jared' }}
          onSubmit={noop}
          component={Form}
          validate={validate}
          validateOnChange={false}
        />
      );
      tree
        .find(Form)
        .props()
        .setFieldValue('name', 'ian');
      expect(validate).not.toHaveBeenCalled();
    });

    it('setTouched sets touched', async () => {
      const tree = shallow(BasicForm);
      tree
        .find(Form)
        .props()
        .setTouched({ name: true });
      expect(
        tree
          .update()
          .find(Form)
          .props().touched
      ).toEqual({ name: true });
    });

    it('setTouched should NOT run validations by default', async () => {
      const validate = jest.fn().mockReturnValue({});
      const tree = shallow(
        <Formik
          initialValues={{ name: 'jared' }}
          onSubmit={noop}
          component={Form}
          validate={validate}
        />
      );
      tree
        .find(Form)
        .props()
        .setTouched({ name: true });
      expect(validate).toHaveBeenCalled();
    });

    it('setTouched should run validations when validateOnBlur is true', () => {
      const validate = jest.fn();

      const tree = shallow(
        <Formik
          initialValues={{ name: 'jared' }}
          onSubmit={noop}
          component={Form}
          validate={validate}
          validateOnBlur={true}
        />
      );
      tree
        .find(Form)
        .props()
        .setTouched({ name: true });
      expect(validate).toHaveBeenCalled();
    });

    it('setFieldTouched sets touched by key', async () => {
      const tree = shallow(BasicForm);
      tree
        .find(Form)
        .props()
        .setFieldTouched('name', true);
      expect(
        tree
          .update()
          .find(Form)
          .props().touched
      ).toEqual({ name: true });
      expect(
        tree
          .update()
          .find(Form)
          .props().dirty
      ).toBe(false);
      tree
        .find(Form)
        .props()
        .setFieldTouched('name', false);
      expect(
        tree
          .update()
          .find(Form)
          .props().touched
      ).toEqual({ name: false });
      expect(
        tree
          .update()
          .find(Form)
          .props().dirty
      ).toBe(false);
    });

    it('setFieldTouched should run validations when validateOnBlur is true', async () => {
      const validate = jest.fn().mockReturnValue({});
      const tree = shallow(
        <Formik
          initialValues={{ name: 'jared' }}
          onSubmit={noop}
          component={Form}
          validate={validate}
          validateOnBlur={true}
        />
      );
      tree
        .find(Form)
        .props()
        .setFieldTouched('name', true);
      expect(validate).toHaveBeenCalled();
    });

    it('setFieldTouched should NOT run validations when validateOnBlur is true', async () => {
      const validate = jest.fn().mockReturnValue({});

      const tree = shallow(
        <Formik
          initialValues={{ name: 'jared' }}
          onSubmit={noop}
          component={Form}
          validate={validate}
          validateOnBlur={false}
        />
      );
      tree
        .find(Form)
        .props()
        .setFieldTouched('name', true);
      expect(validate).not.toHaveBeenCalled();
    });

    it('setErrors sets error object', async () => {
      const tree = shallow(BasicForm);
      tree
        .find(Form)
        .props()
        .setErrors({ name: 'Required' });

      expect(
        tree
          .update()
          .find(Form)
          .props().errors.name
      ).toEqual('Required');
    });

    it('setFieldError sets error by key', async () => {
      const tree = shallow(BasicForm);
      tree
        .find(Form)
        .props()
        .setFieldError('name', 'Required');
      expect(
        tree
          .update()
          .find(Form)
          .props().errors.name
      ).toEqual('Required');
    });

    it('setStatus sets status object', async () => {
      const tree = shallow(BasicForm);
      const status = 'status';
      tree
        .find(Form)
        .props()
        .setStatus(status);

      expect(
        tree
          .update()
          .find(Form)
          .props().status
      ).toEqual(status);
    });
  });

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
  });

  describe('componentWillReceiveProps', () => {
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
      form.componentWillReceiveProps({
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
      form.componentWillReceiveProps({
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
      form.componentWillReceiveProps({
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
      form.componentWillReceiveProps({
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
          initialValues={{ foo: 'bar', bar: 'foo' }}
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
        { foo: 'bar', bar: 'foo' },
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
          initialValues={{ foo: 'bar' }}
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
          initialValues={{ foo: 'bar', bar: 'foo' }}
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
        { foo: 'bar', bar: 'foo' },
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
  });
});
