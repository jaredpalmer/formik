import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { Formik, InjectedFormikProps } from '../.';

import Yup from 'yup';

describe('Formik', () => {
  it('renders Formik correctly', () => {
    interface Props {
      thing: string;
    }
    const Form: React.SFC<InjectedFormikProps<Props, Props>> = ({
      values,
      handleSubmit,
      handleChange,
      errors,
    }) => {
      return (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            onChange={handleChange}
            value={values.thing}
            name="thing"
          />
          {errors.thing &&
            <div>
              {errors.thing}
            </div>}
          <input type="submit" value="Submit" />
        </form>
      );
    };

    const FormikEnhancer = Formik<Props, Props, Props>({
      validationSchema: Yup.object().shape({
        thing: Yup.string(),
      }),
      handleSubmit: payload => {
        console.log(payload);
      },
    });

    const EnhancedForm = FormikEnhancer(Form);

    const tree = renderer.create(<EnhancedForm thing="hello" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('mapsPropsToValues', () => {
    interface Props {
      hello: string;
    }
    interface Values {
      thing: string;
    }

    const Form: React.SFC<InjectedFormikProps<Props, Values>> = ({
      values,
      handleSubmit,
      handleChange,
      errors,
    }) => {
      return (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            onChange={handleChange}
            value={values.thing}
            name="thing"
          />
          {errors.thing &&
            <div>
              {errors.thing}
            </div>}
          <input type="submit" value="Submit" />
        </form>
      );
    };

    const FormikEnhancer = Formik<Props, Values, Values>({
      mapPropsToValues: ({ hello }) => ({ thing: hello }),
      validationSchema: Yup.object().shape({
        thing: Yup.string(),
      }),
      handleSubmit: payload => {
        console.log(payload);
      },
    });

    const EnhancedForm = FormikEnhancer(Form);

    const tree = renderer.create(<EnhancedForm hello="hello" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
