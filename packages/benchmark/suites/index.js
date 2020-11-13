import React from 'react';
import { create } from 'react-test-renderer';
import { Formik, Field } from 'formik';

export default {
  '<form />': () => {
    const Component = () => {
      return (
        <form>
          <input name="name" />
        </form>
      );
    };

    create(<Component />);
  },
  '<Field />': () => {
    const Component = () => {
      return (
        <Formik initialValues={{ name: 'Dhruv' }}>
          {() => <Field name="name" />}
        </Formik>
      );
    };

    create(<Component />);
  },
};
