import React from 'react';
import ReactDOM from 'react-dom';
import { Formik, Field } from 'formik';

export default {
  '<Field />': () => {
    const Component = () => {
      return (
        <Formik initialValues={{ name: 'Dhruv' }}>
          {() => <Field name="name" />}
        </Formik>
      );
    };

    ReactDOM.render(<Component />);
  },
};
