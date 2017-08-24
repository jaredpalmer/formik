import * as React from 'react';

import { Field, Form, Formik, FormikProps } from '../src/formik';

interface Values {
  email: string;
}

export const BasicExample: React.SFC<{}> = () => {
  return (
    <div>
      <h1>My Cool Form</h1>
      <Formik
        handleSubmit={(values: Values) => console.log(values)}
        getInitialValues={{ email: '' }}
        component={MyForm}
      />
    </div>
  );
};

export const MyForm: React.SFC<FormikProps<Values>> = () =>
  <Form className="whatever">
    <Field name="email" type="email" />
    <button type="submit">Submit</button>
  </Form>;
