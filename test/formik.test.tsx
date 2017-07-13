import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { Formik, InjectedFormikProps } from '../src/formik';
import { mount, shallow } from 'enzyme';

const Yup = require('yup');

describe('Formik', () => {
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
        <button type="submit">Submit</button>
      </form>
    );
  };

  it('renders Formik correctly', () => {
    const EnhancedForm = Formik<Props, Values, Values>({
      validationSchema: Yup.object().shape({
        name: Yup.string(),
      }),
      mapPropsToValues: ({ user }) => ({ ...user }),
      // tslint:disable-next-line:no-empty
      handleSubmit: () => {},
    })(Form);

    const tree = renderer
      .create(<EnhancedForm user={{ name: 'jared' }} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('initializes Formik state', () => {
    const EnhancedForm = Formik<Props, Values, Values>({
      validationSchema: Yup.object().shape({
        name: Yup.string(),
      }),
      mapPropsToValues: ({ user }) => ({ ...user }),
      // tslint:disable-next-line:no-empty
      handleSubmit: () => {},
    })(Form);
    const hoc = mount(<EnhancedForm user={{ name: 'jared' }} />);
    expect(hoc.state().isSubmitting).toBe(false);
    expect(hoc.state().touched).toEqual({});
    expect(hoc.state().values).toEqual({ name: 'jared' });
    expect(hoc.state().errors).toEqual({});
  });

  describe('handleSubmit', () => {
    it('calls preventDefault()', () => {
      const EnhancedForm = Formik<Props, Values, Values>({
        validationSchema: Yup.object().shape({
          name: Yup.string(),
        }),
        mapPropsToValues: ({ user }) => ({ ...user }),
        // tslint:disable-next-line:no-empty
        handleSubmit: () => {},
      })(Form);
      const hoc = mount(<EnhancedForm user={{ name: 'jared' }} />);
      const preventDefault = jest.fn();
      hoc.find('form').simulate('submit', { preventDefault });
      expect(preventDefault).toHaveBeenCalled();
    });

    it('touches all fields', () => {
      const EnhancedForm = Formik<Props, Values, Values>({
        validationSchema: Yup.object().shape({
          name: Yup.string(),
        }),
        mapPropsToValues: ({ user }) => ({ ...user }),
        // tslint:disable-next-line:no-empty
        handleSubmit: () => {},
      })(Form);
      const hoc = mount(<EnhancedForm user={{ name: 'jared' }} />);
      hoc.find('form').simulate('submit');
      expect(hoc.state().isSubmitting).toBe(true);
      expect(hoc.state().touched).toEqual({ name: true });
    });

    it('pushes submission state chagnes to child component', async () => {
      const EnhancedForm = Formik<Props, Values, Values>({
        validationSchema: Yup.object().shape({
          name: Yup.string().required(),
        }),
        mapPropsToValues: ({ user }) => ({ ...user }),
        handleSubmit: payload => {
          expect(payload).toEqual({ name: 'jared' });
        },
      })(Form);
      const hoc = shallow(<EnhancedForm user={{ name: 'jared' }} />);

      expect(hoc.find(Form).dive().find('#submitting')).toHaveLength(0);

      hoc.find(Form).dive().find('form').simulate('submit', {
        // tslint:disable-next-line:no-empty
        preventDefault() {},
      });
      expect(hoc.find(Form).dive().find('#submitting')).toHaveLength(1);
    });
  });

  describe('formikBag', () => {
    it('handleBlur sets touched', async () => {
      const EnhancedForm = Formik<Props, Values, Values>({
        validationSchema: Yup.object().shape({
          name: Yup.string().required(),
        }),
        mapPropsToValues: ({ user }) => ({ ...user }),
        handleSubmit: payload => {
          expect(payload).toEqual({ name: 'jared' });
        },
      })(Form);

      const hoc = shallow(<EnhancedForm user={{ name: 'jared' }} />);

      // Simulate a blur event in the inner Form component's input
      hoc.find(Form).dive().find('input').simulate('blur', {
        // tslint:disable-next-line:no-empty
        persist() {},
        target: {
          name: 'name',
        },
      });
      expect(hoc.update().state().touched).toEqual({ name: true });
    });

    it('handleChange sets values, and updates inputs', async () => {
      const EnhancedForm = Formik<Props, Values, Values>({
        validationSchema: Yup.object().shape({
          name: Yup.string().required(),
        }),
        mapPropsToValues: ({ user }) => ({ ...user }),
        handleSubmit: payload => {
          expect(payload).toEqual({ name: 'jared' });
        },
      })(Form);

      const hoc = shallow(<EnhancedForm user={{ name: 'jared' }} />);

      // Simulate a change event in the inner Form component's input
      hoc.find(Form).dive().find('input').simulate('change', {
        // tslint:disable-next-line:no-empty
        persist() {},
        target: {
          name: 'name',
          value: 'ian',
        },
      });

      expect(hoc.update().state().values).toEqual({ name: 'ian' });
      expect(
        hoc.update().find(Form).dive().find('input').props().value
      ).toEqual('ian');
    });
  });
});
