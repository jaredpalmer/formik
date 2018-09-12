import * as React from 'react';

import { withFormik, FormikProps } from '../src';
import { mount, shallow } from '@pisano/enzyme';

// tslint:disable-next-line:no-empty
const noop = () => {};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface Props {
  user: {
    name: string;
  };
  someFunction?: () => void;
}

interface Values {
  name: string;
}

const Form: React.SFC<Props & FormikProps<Values>> = ({
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
        onClick={() => setStatus({ myStatusMessage: 'True' })}
      >
        Call setStatus
      </button>
      {status &&
        !!status.myStatusMessage && (
          <div id="statusMessage">{status.myStatusMessage}</div>
        )}
      <button type="submit">Submit</button>
    </form>
  );
};

const FormFactory = (options = {}) =>
  withFormik<Props, Values, Values>({
    mapPropsToValues: ({ user }) => ({ ...user }),
    handleSubmit: noop,
    ...options,
  })(Form);

const BasicForm = FormFactory();

describe('withFormik()', () => {
  it('should initialize Formik state and pass down props', () => {
    const tree = mount(<BasicForm user={{ name: 'jared' }} />);
    expect(tree.find(Form).props().isSubmitting).toBe(false);
    expect(tree.find(Form).props().touched).toEqual({});
    expect(tree.find(Form).props().values).toEqual({ name: 'jared' });
    expect(tree.find(Form).props().errors).toEqual({});
    expect(tree.find(Form).props().dirty).toBe(false);
    expect(tree.find(Form).props().isValid).toBe(false);
  });

  it('should correctly set displayName', () => {
    const tree = mount(<BasicForm user={{ name: 'jared' }} />);
    expect((tree.get(0).type as any).displayName).toBe('WithFormik(Form)');
  });

  describe('FormikHandlers', () => {
    describe('handleChange', () => {
      it('sets values state', async () => {
        const tree = mount(<BasicForm user={{ name: 'jared' }} />);

        // Simulate a change event in the inner Form component's input
        tree
          .find(Form)
          .find('input')
          .simulate('change', {
            persist: noop,
            target: {
              id: 'name',
              value: 'ian',
            },
          });
        expect(
          tree
            .find(Form)
            .find('input')
            .props().value
        ).toEqual('ian');
      });

      it('updates values state via `name` instead of `id` attribute when both are present', async () => {
        const tree = mount(<BasicForm user={{ name: 'jared' }} />);

        // Simulate a change event in the inner Form component's input
        tree
          .find(Form)
          .find('input')
          .simulate('change', {
            persist: noop,
            target: {
              id: 'person-1-thinger',
              name: 'name',
              value: 'ian',
            },
          });

        expect(tree.find(Form).props().values).toEqual({ name: 'ian' });
        expect(
          tree
            .find(Form)
            .find('input')
            .props().value
        ).toEqual('ian');
      });

      it('runs validations by default (validate)', async () => {
        const validate = jest.fn(noop);
        const ValidationForm = FormFactory({
          validate,
        });
        const tree = shallow(<ValidationForm user={{ name: 'jared' }} />);
        tree
          .dive()
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

      it('does NOT run validations if validateOnChange is false (validate)', async () => {
        const validate = jest.fn(noop);
        const ValidationForm = FormFactory({
          validate,
          validateOnChange: false,
        });
        const tree = shallow(<ValidationForm user={{ name: 'jared' }} />);

        tree
          .dive()
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

      it('runs validations by default (validationSchema)', async () => {
        const validate = jest.fn(() => Promise.resolve({}));
        const ValidationForm = FormFactory({ validationSchema: { validate } });

        const tree = shallow(<ValidationForm user={{ name: 'jared' }} />);

        tree
          .dive()
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

      it('does NOT run validations if validateOnChange is false (validationSchema)', async () => {
        const validate = jest.fn(() => Promise.resolve({}));
        const ValidationForm = FormFactory({
          validateOnChange: false,
          validationSchema: { validate },
        });

        const tree = shallow(<ValidationForm user={{ name: 'jared' }} />);

        tree
          .dive()
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
        const tree = mount(<BasicForm user={{ name: 'jared' }} />);

        // Simulate a blur event in the inner Form component's input
        tree
          .find(Form)
          .find('input')
          .simulate('blur', {
            persist: noop,
            target: {
              id: 'name',
            },
          });
        expect(tree.find(Form).props().touched).toEqual({ name: true });
      });

      it('updates touched state via `name` instead of `id` attribute when both are present', () => {
        const tree = mount(<BasicForm user={{ name: 'jared' }} />);

        // Simulate a blur event in the inner Form component's input
        tree
          .find(Form)
          .find('input')
          .simulate('blur', {
            persist: noop,
            target: {
              id: 'person-1-name-blah',
              name: 'name',
            },
          });
        expect(tree.find(Form).props().touched).toEqual({ name: true });
      });

      it('runs validations by default (validate)', async () => {
        const validate = jest.fn(noop);
        const ValidationForm = FormFactory({ validate });

        const tree = shallow(<ValidationForm user={{ name: 'jared' }} />);

        tree
          .dive()
          .find(Form)
          .dive()
          .find('input')
          .simulate('blur', {
            persist: noop,
            target: {
              name: 'name',
            },
          });
        expect(validate).toHaveBeenCalled();
      });

      it('runs validations by default (validationSchema)', async () => {
        const validate = jest.fn(() => Promise.resolve({}));
        const ValidationForm = FormFactory({ validationSchema: { validate } });

        const tree = shallow(<ValidationForm user={{ name: 'jared' }} />);

        tree
          .dive()
          .find(Form)
          .dive()
          .find('input')
          .simulate('blur', {
            persist: noop,
            target: {
              name: 'name',
            },
          });

        expect(validate).toHaveBeenCalled();
      });
    });

    describe('handleSubmit', () => {
      it('should call preventDefault()', () => {
        const tree = mount(<BasicForm user={{ name: 'jared' }} />);
        const preventDefault = jest.fn();
        tree
          .find(Form)
          .find('form')
          .simulate('submit', {
            preventDefault,
          });
        expect(preventDefault).toHaveBeenCalled();
      });

      it('should touch all fields', () => {
        const tree = mount(<BasicForm user={{ name: 'jared' }} />);
        tree
          .find(Form)
          .find('form')
          .simulate('submit', {
            preventDefault: noop,
          });
        expect(tree.find(Form).props().touched).toEqual({
          name: true,
        });
      });

      it('should push submission state changes to child component', () => {
        const tree = mount(<BasicForm user={{ name: 'jared' }} />);

        expect(tree.find(Form).find('#submitting')).toHaveLength(0);

        tree
          .find(Form)
          .find('form')
          .simulate('submit', {
            preventDefault: noop,
          });

        expect(tree.find(Form).find('#submitting')).toHaveLength(1);
      });

      describe('with validate (SYNC)', () => {
        it('should call validate if present', async () => {
          const validate = jest.fn().mockReturnValue({});
          const ValidateForm = withFormik<Props, Values, Values>({
            validate,
            mapPropsToValues: ({ user }) => ({ ...user }),
            handleSubmit: noop,
          })(Form);
          const tree = mount(<ValidateForm user={{ name: 'jared' }} />);
          await tree
            .find(Form)
            .props()
            .submitForm();
          expect(validate).toHaveBeenCalled();
        });

        it('should submit the form if valid', async () => {
          const handleSubmit = jest.fn();
          const ValidateForm = withFormik<Props, Values, Values>({
            validate: noop,
            mapPropsToValues: ({ user }) => ({ ...user }),
            handleSubmit,
          })(Form);
          const tree = mount(<ValidateForm user={{ name: 'jared' }} />);
          await tree
            .find(Form)
            .props()
            .submitForm();
          expect(handleSubmit).toHaveBeenCalled();
        });

        it('should not submit the form if invalid', async () => {
          const validate = jest.fn().mockReturnValue({ name: 'Error!' });
          const handleSubmit = jest.fn();

          const ValidateForm = withFormik<Props, Values, Values>({
            validate,
            mapPropsToValues: ({ user }) => ({ ...user }),
            handleSubmit,
          })(Form);

          const tree = mount(<ValidateForm user={{ name: '' }} />);
          await tree
            .find(Form)
            .props()
            .submitForm();
          expect(validate).toHaveBeenCalled();
          expect(handleSubmit).not.toHaveBeenCalled();
        });
      });

      describe('with validate (ASYNC)', () => {
        it('should call validate if present', async () => {
          const validate = jest.fn(() => Promise.resolve({}));
          const ValidateForm = withFormik<Props, Values, Values>({
            validate,
            mapPropsToValues: ({ user }) => ({ ...user }),
            handleSubmit: noop,
          })(Form);
          const tree = mount(<ValidateForm user={{ name: 'jared' }} />);
          await tree
            .find(Form)
            .props()
            .submitForm();
          expect(validate).toHaveBeenCalled();
        });

        it('should submit the form if valid', async () => {
          const handleSubmit = jest.fn();

          const ValidateForm = withFormik<Props, Values, Values>({
            validate: () => Promise.resolve({}),
            mapPropsToValues: ({ user }) => ({ ...user }),
            handleSubmit,
          })(Form);

          const tree = mount(<ValidateForm user={{ name: '' }} />);
          await tree
            .find(Form)
            .props()
            .submitForm();

          expect(handleSubmit).toHaveBeenCalled();
        });

        it('should not submit the form if invalid', async () => {
          const handleSubmit = jest.fn();

          const ValidateForm = withFormik<Props, Values, Values>({
            validate: () =>
              sleep(25).then(() => {
                throw { name: 'error!' };
              }),
            mapPropsToValues: ({ user }) => ({ ...user }),
            handleSubmit,
          })(Form);

          const tree = mount(<ValidateForm user={{ name: '' }} />);
          await tree
            .find(Form)
            .props()
            .submitForm();

          expect(handleSubmit).not.toHaveBeenCalled();
        });
      });

      describe('with validationSchema (ASYNC)', () => {
        it('should run validationSchema if present', async () => {
          const validate = jest.fn(() => Promise.resolve({}));
          const ValidateForm = FormFactory({ validationSchema: { validate } });
          const tree = mount(<ValidateForm user={{ name: 'jared' }} />);

          await tree
            .find(Form)
            .props()
            .submitForm();

          expect(validate).toHaveBeenCalled();
        });

        it('should call validationSchema if it is a function and present', async () => {
          const validate = jest.fn(() => Promise.resolve({}));
          const ValidateForm = FormFactory({
            validationSchema: () => ({
              validate,
            }),
          });
          const tree = mount(<ValidateForm user={{ name: 'jared' }} />);
          await tree
            .find(Form)
            .props()
            .submitForm();
          expect(validate).toHaveBeenCalled();
        });
      });
    });
  });
});
