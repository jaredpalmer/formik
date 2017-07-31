import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { Formik, InjectedFormikProps } from '../src/formik';
import { mount, shallow } from 'enzyme';

const Yup = require('yup');

// tslint:disable-next-line:no-empty
const noop = () => {};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

interface Props {
  user: {
    name: string;
  };
  someFunction?: () => void;
}

interface Values {
  name: string;
}

const Form: React.SFC<InjectedFormikProps<Props, Values>> = ({
  values,
  handleSubmit,
  handleChange,
  handleBlur,
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
      {errors.name &&
        <div id="feedback">
          {errors.name}
        </div>}
      {isSubmitting && <div id="submitting">Submitting</div>}
      <button
        id="statusButton"
        onClick={() => setStatus({ myStatusMessage: 'True' })}
      >
        Call setStatus
      </button>
      {status &&
        !!status.myStatusMessage &&
        <div id="statusMessage">
          {status.myStatusMessage}
        </div>}
      <button type="submit">Submit</button>
    </form>
  );
};

const FormFactory = (options = {}) =>
  Formik<Props, Values, Values>({
    mapPropsToValues: ({ user }) => ({ ...user }),
    handleSubmit: noop,
    ...options,
  })(Form);

const BasicForm = FormFactory();

describe('Formik', () => {
  it('should initialize Formik state and pass down props', () => {
    const tree = shallow(<BasicForm user={{ name: 'jared' }} />);
    expect(tree.find(Form).props().isSubmitting).toBe(false);
    expect(tree.find(Form).props().touched).toEqual({});
    expect(tree.find(Form).props().values).toEqual({ name: 'jared' });
    expect(tree.find(Form).props().errors).toEqual({});
    expect(tree.find(Form).props().dirty).toBe(false);
    expect(tree.find(Form).props().isValid).toBe(false);
  });

  it('should compute isValid if isInitialValid is present and returns true', () => {
    const InvalidForm = FormFactory({ isInitialValid: props => true });
    const tree = shallow(<InvalidForm user={{ name: 'jared' }} />);
    expect(tree.find(Form).props().dirty).toBe(false);
    expect(tree.find(Form).props().isValid).toBe(true);
  });

  it('should compute isValid if isInitialValid is present and returns false', () => {
    const InvalidForm = FormFactory({ isInitialValid: props => false });
    const tree = shallow(<InvalidForm user={{ name: 'jared' }} />);
    expect(tree.find(Form).props().dirty).toBe(false);
    expect(tree.find(Form).props().isValid).toBe(false);
  });

  it('should compute isValid if isInitialValid boolean is present and set to true', () => {
    const InvalidForm = FormFactory({ isInitialValid: true });
    const tree = shallow(<InvalidForm user={{ name: 'jared' }} />);
    expect(tree.find(Form).props().dirty).toBe(false);
    expect(tree.find(Form).props().isValid).toBe(true);
  });

  it('should compute isValid if isInitialValid is present and set to false', () => {
    const InvalidForm = FormFactory({ isInitialValid: false });
    const tree = shallow(<InvalidForm user={{ name: 'jared' }} />);
    expect(tree.find(Form).props().dirty).toBe(false);
    expect(tree.find(Form).props().isValid).toBe(false);
  });

  describe('FormikHandlers', () => {
    describe('handleChange', () => {
      it('sets values state', async () => {
        const tree = shallow(<BasicForm user={{ name: 'jared' }} />);

        // Simulate a change event in the inner Form component's input
        tree.find(Form).dive().find('input').simulate('change', {
          persist: noop,
          target: {
            id: 'name',
            value: 'ian',
          },
        });

        expect(tree.update().state().values).toEqual({ name: 'ian' });
        expect(
          tree.update().find(Form).dive().find('input').props().value
        ).toEqual('ian');
      });

      it('updates values state via `name` instead of `id` attribute when both are present', async () => {
        const tree = shallow(<BasicForm user={{ name: 'jared' }} />);

        // Simulate a change event in the inner Form component's input
        tree.find(Form).dive().find('input').simulate('change', {
          persist: noop,
          target: {
            id: 'person-1-thinger',
            name: 'name',
            value: 'ian',
          },
        });

        expect(tree.update().state().values).toEqual({ name: 'ian' });
        expect(
          tree.update().find(Form).dive().find('input').props().value
        ).toEqual('ian');
      });

      it('runs validations if validateOnChange is set to true', async () => {
        const validate = jest.fn(noop);
        const ValidationForm = FormFactory({
          validate,
          validateOnChange: true,
        });
        const tree = shallow(<ValidationForm user={{ name: 'jared' }} />);
        tree.find(Form).dive().find('input').simulate('change', {
          persist: noop,
          target: {
            name: 'name',
            value: 'ian',
          },
        });
        expect(validate).toHaveBeenCalled();
      });

      it('does NOT run validations by default or if validateOnChange is set to false', async () => {
        const validate = jest.fn(noop);
        const ValidationForm = FormFactory({ validate });
        const tree = shallow(<ValidationForm user={{ name: 'jared' }} />);
        tree.find(Form).dive().find('input').simulate('change', {
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
        const tree = shallow(<BasicForm user={{ name: 'jared' }} />);

        // Simulate a blur event in the inner Form component's input
        tree.find(Form).dive().find('input').simulate('blur', {
          persist: noop,
          target: {
            id: 'name',
          },
        });
        expect(tree.update().state().touched).toEqual({ name: true });
      });

      it('updates touched state via `name` instead of `id` attribute when both are present', () => {
        const tree = shallow(<BasicForm user={{ name: 'jared' }} />);

        // Simulate a blur event in the inner Form component's input
        tree.find(Form).dive().find('input').simulate('blur', {
          persist: noop,
          target: {
            id: 'person-1-name-blah',
            name: 'name',
          },
        });
        expect(tree.update().state().touched).toEqual({ name: true });
      });

      it('runs validations by default or if validateOnBlur is set to true ', async () => {
        const validate = jest.fn(noop);
        const ValidationForm = FormFactory({ validate });
        const ValidationForm2 = FormFactory({ validate, validateOnBlur: true });
        const tree = shallow(<ValidationForm user={{ name: 'jared' }} />);
        const tree2 = shallow(<ValidationForm2 user={{ name: 'jared' }} />);
        tree.find(Form).dive().find('input').simulate('blur', {
          persist: noop,
          target: {
            name: 'name',
          },
        });
        tree2.find(Form).dive().find('input').simulate('blur', {
          persist: noop,
          target: {
            name: 'name',
          },
        });
        expect(validate).toHaveBeenCalledTimes(2);
      });
    });

    describe('handleSubmit', () => {
      it('should call preventDefault()', () => {
        const tree = shallow(<BasicForm user={{ name: 'jared' }} />);
        const preventDefault = jest.fn();
        tree.find(Form).dive().find('form').simulate('submit', {
          preventDefault,
        });
        expect(preventDefault).toHaveBeenCalled();
      });

      it('should touch all fields', () => {
        const tree = shallow(<BasicForm user={{ name: 'jared' }} />);
        tree.find(Form).dive().find('form').simulate('submit', {
          preventDefault: noop,
        });
        expect(tree.update().state().touched).toEqual({ name: true });
      });

      it('should push submission state changes to child component', () => {
        const tree = shallow(<BasicForm user={{ name: 'jared' }} />);

        expect(tree.find(Form).dive().find('#submitting')).toHaveLength(0);

        tree.find(Form).dive().find('form').simulate('submit', {
          preventDefault: noop,
        });

        expect(tree.find(Form).dive().find('#submitting')).toHaveLength(1);
      });

      it('should correctly map form values to payload', () => {
        interface Payload {
          user: { name: string };
        }
        const CustomPayloadForm = Formik<Props, Values, Payload>({
          mapPropsToValues: ({ user }) => ({ ...user }),
          mapValuesToPayload: ({ name }) => ({ user: { name } }),
          handleSubmit: payload => {
            expect(payload).toEqual({ user: { name: 'jared' } });
            expect(payload).not.toEqual({ name: 'jared' });
          },
        })(Form);
        const tree = shallow(<CustomPayloadForm user={{ name: 'jared' }} />);
        tree.find(Form).dive().find('form').simulate('submit', {
          preventDefault: noop,
        });
      });

      describe('with validate (SYNC)', () => {
        it('should call validate if present', () => {
          const validate = jest.fn().mockReturnValue({});
          const ValidateForm = Formik<Props, Values, Values>({
            validate,
            mapPropsToValues: ({ user }) => ({ ...user }),
            handleSubmit: noop,
          })(Form);
          const tree = shallow(<ValidateForm user={{ name: 'jared' }} />);
          tree.find(Form).dive().find('form').simulate('submit', {
            preventDefault: noop,
          });
          expect(validate).toHaveBeenCalled();
        });

        it('should submit the form if valid', () => {
          const handleSubmit = jest.fn();
          const ValidateForm = Formik<Props, Values, Values>({
            validate: noop,
            mapPropsToValues: ({ user }) => ({ ...user }),
            handleSubmit,
          })(Form);
          const tree = shallow(<ValidateForm user={{ name: 'jared' }} />);
          tree.find(Form).dive().find('form').simulate('submit', {
            preventDefault: noop,
          });
          expect(handleSubmit).toHaveBeenCalled();
        });

        it('should not submit the form if invalid', () => {
          const validate = jest.fn().mockReturnValue({ name: 'Error!' });
          const handleSubmit = jest.fn();

          const ValidateForm = Formik<Props, Values, Values>({
            validate,
            mapPropsToValues: ({ user }) => ({ ...user }),
            handleSubmit,
          })(Form);

          const tree = shallow(<ValidateForm user={{ name: '' }} />);
          tree.find(Form).dive().find('form').simulate('submit', {
            preventDefault: noop,
          });
          expect(validate).toHaveBeenCalled();
          expect(handleSubmit).not.toHaveBeenCalled();
        });
      });

      describe('with validate (ASYNC)', () => {
        it('should call validate if present', () => {
          const validate = jest.fn(() => Promise.resolve({}));
          const ValidateForm = Formik<Props, Values, Values>({
            validate,
            mapPropsToValues: ({ user }) => ({ ...user }),
            handleSubmit: noop,
          })(Form);
          const tree = shallow(<ValidateForm user={{ name: 'jared' }} />);
          tree.find(Form).dive().find('form').simulate('submit', {
            preventDefault: noop,
          });
          expect(validate).toHaveBeenCalled();
        });

        it('should submit the form if valid', async () => {
          const handleSubmit = jest.fn();

          const ValidateForm = Formik<Props, Values, Values>({
            validate: () => Promise.resolve({}),
            mapPropsToValues: ({ user }) => ({ ...user }),
            handleSubmit,
          })(Form);

          const tree = shallow(<ValidateForm user={{ name: '' }} />);
          await tree.find(Form).props().submitForm();

          expect(handleSubmit).toHaveBeenCalled();
        });

        it('should not submit the form if invalid', async () => {
          const handleSubmit = jest.fn();

          const ValidateForm = Formik<Props, Values, Values>({
            validate: () =>
              sleep(25).then(() => {
                throw { name: 'error!' };
              }),
            mapPropsToValues: ({ user }) => ({ ...user }),
            handleSubmit,
          })(Form);

          const tree = shallow(<ValidateForm user={{ name: '' }} />);
          await tree.find(Form).props().submitForm();

          expect(handleSubmit).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('FormikActions', () => {
    it('setValues sets values', async () => {
      const tree = shallow(<BasicForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setValues({ name: 'ian' });
      expect(tree.find(Form).dive().find('input').props().value).toEqual('ian');
    });

    it('setValues should run validations when validateOnChange is true', async () => {
      const validate = jest.fn().mockReturnValue({});
      const ValidateOnBlurForm = FormFactory({
        validate,
        validateOnChange: true,
      });
      const tree = shallow(<ValidateOnBlurForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setValues({ name: 'ian' });
      expect(validate).toHaveBeenCalled();
    });

    it('setValues should NOT run validations when validateOnChange is false or undefined', () => {
      const validate = jest.fn();
      const ValidateOnBlurForm = FormFactory({ validate });
      const tree = shallow(<ValidateOnBlurForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setValues({ name: 'ian' });
      expect(validate).not.toHaveBeenCalled();
    });

    it('setFieldValue sets value by key', () => {
      const tree = shallow(<BasicForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setFieldValue('name', 'ian');
      expect(tree.find(Form).dive().find('input').props().value).toEqual('ian');
    });

    it('setFieldValue should run validations when validateOnChange is true', () => {
      const validate = jest.fn().mockReturnValue({});
      const ValidateOnBlurForm = FormFactory({
        validate,
        validateOnChange: true,
      });
      const tree = shallow(<ValidateOnBlurForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setFieldValue('name', 'ian');
      expect(validate).toHaveBeenCalled();
    });

    it('setFieldValue should NOT run validations when validateOnChange is false or undefined', () => {
      const validate = jest.fn();
      const ValidateOnBlurForm = FormFactory({ validate });
      const tree = shallow(<ValidateOnBlurForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setFieldValue('name', 'ian');
      expect(validate).not.toHaveBeenCalled();
    });

    it('setTouched sets touched', async () => {
      const tree = shallow(<BasicForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setTouched({ name: true });
      expect(tree.find(Form).props().touched).toEqual({ name: true });
    });

    it('setTouched should run validations by default, or when validateOnBlur is true', async () => {
      const validate = jest.fn().mockReturnValue({});
      const ValidateOnBlurForm = FormFactory({
        validate,
      });
      const tree = shallow(<ValidateOnBlurForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setTouched({ name: true });
      expect(validate).toHaveBeenCalled();
    });

    it('setTouched should NOT run validations when validateOnBlur is false', () => {
      const validate = jest.fn();
      const ValidateOnBlurForm = FormFactory({
        validate,
        validateOnBlur: false,
      });
      const tree = shallow(<ValidateOnBlurForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setTouched({ name: true });
      expect(validate).not.toHaveBeenCalled();
    });

    it('setFieldTouched sets touched by key', async () => {
      const tree = shallow(<BasicForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setFieldTouched('name', true);
      expect(tree.find(Form).props().touched).toEqual({ name: true });
      expect(tree.find(Form).props().dirty).toBe(true);
      tree.find(Form).props().setFieldTouched('name', false);
      expect(tree.find(Form).props().touched).toEqual({ name: false });
      expect(tree.find(Form).props().dirty).toBe(false);
    });

    it('setFieldTouched should run validations when validateOnBlur is true', async () => {
      const validate = jest.fn().mockReturnValue({});
      const ValidateOnBlurForm = FormFactory({
        validate,
        validateOnBlur: true,
      });
      const tree = shallow(<ValidateOnBlurForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setFieldTouched('name', true);
      expect(validate).toHaveBeenCalled();
    });

    it('setFieldTouched should NOT run validations when validateOnBlur is true', async () => {
      const validate = jest.fn().mockReturnValue({});
      const ValidateOnBlurForm = FormFactory({
        validate,
        validateOnBlur: false,
      });
      const tree = shallow(<ValidateOnBlurForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setFieldTouched('name', true);
      expect(validate).not.toHaveBeenCalled();
    });

    it('setErrors sets error object', async () => {
      const tree = shallow(<BasicForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setErrors({ name: 'Required' });
      expect(tree.find(Form).dive().find('#feedback').text()).toEqual(
        'Required'
      );
    });

    it('setFieldError sets error by key', async () => {
      const tree = shallow(<BasicForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setFieldError('name', 'Required');
      expect(tree.find(Form).dive().find('#feedback').text()).toEqual(
        'Required'
      );
    });

    it('setStatus sets status object', async () => {
      const tree = shallow(<BasicForm user={{ name: 'jared' }} />);
      tree.find(Form).dive().find('#statusButton').simulate('click');
      expect(tree.find(Form).dive().find('#statusMessage')).toHaveLength(1);
    });
  });

  describe('FormikComputedProps', () => {
    it('dirty, should update as soon as any input is touched', () => {
      const tree = mount(<BasicForm user={{ name: 'jared' }} />);

      expect(tree.find(Form).props().dirty).toBe(false);

      tree.setState({ touched: { name: true } });

      expect(tree.update().find(Form).props().dirty).toBe(true);
    });
  });
});
