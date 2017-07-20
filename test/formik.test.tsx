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

const BasicForm = Formik<Props, Values, Values>({
  mapPropsToValues: ({ user }) => ({ ...user }),
  handleSubmit: noop,
})(Form);

describe('Formik', () => {
  it('should initialize Formik state', () => {
    const tree = mount(<BasicForm user={{ name: 'jared' }} />);
    expect(tree.state().isSubmitting).toBe(false);
    expect(tree.state().touched).toEqual({});
    expect(tree.state().values).toEqual({ name: 'jared' });
    expect(tree.state().errors).toEqual({});
  });

  describe('FormikHandlers', () => {
    describe('handleChange', () => {
      it('sets values, and updates inputs', async () => {
        const tree = shallow(<BasicForm user={{ name: 'jared' }} />);

        // Simulate a change event in the inner Form component's input
        tree.find(Form).dive().find('input').simulate('change', {
          persist: noop,
          target: {
            name: 'name',
            value: 'ian',
          },
        });

        expect(tree.update().state().values).toEqual({ name: 'ian' });
        expect(
          tree.update().find(Form).dive().find('input').props().value
        ).toEqual('ian');
      });
    });

    describe('handleBlur', () => {
      it('handleBlur sets touched', async () => {
        const tree = shallow(<BasicForm user={{ name: 'jared' }} />);

        // Simulate a blur event in the inner Form component's input
        tree.find(Form).dive().find('input').simulate('blur', {
          persist: noop,
          target: {
            name: 'name',
          },
        });
        expect(tree.update().state().touched).toEqual({ name: true });
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

          const tree = mount(<ValidateForm user={{ name: '' }} />);
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

          const tree = mount(<ValidateForm user={{ name: '' }} />);
          await tree.find(Form).props().submitForm();

          expect(handleSubmit).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('FormikActions', () => {
    it('setValues sets values', async () => {
      const tree = mount(<BasicForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setValues({ name: 'ian' });
      expect(tree.find('input').props().value).toEqual('ian');
    });

    it('setFieldValue sets value by key', async () => {
      const tree = mount(<BasicForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setFieldValue('name', 'ian');
      expect(tree.find('input').props().value).toEqual('ian');
    });

    it('setErrors sets error object', async () => {
      const tree = mount(<BasicForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setErrors({ name: 'Required' });
      expect(tree.find('#feedback').text()).toEqual('Required');
    });

    it('setFieldError sets error by key', async () => {
      const tree = mount(<BasicForm user={{ name: 'jared' }} />);
      tree.find(Form).props().setFieldError('name', 'Required');
      expect(tree.find('#feedback').text()).toEqual('Required');
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
