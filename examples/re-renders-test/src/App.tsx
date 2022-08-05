import React from 'react';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';
import { Debug } from './Debug';
import {
  ButtonSetFieldError,
  Input,
  InputWithIsSubmitting,
  InputWithUseField,
  WithFieldArray,
  WithUseFormikContext,
  WatchFieldWithUseField,
  WatchFieldWithUseFormikSelector,
} from './components';

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  friends: [
    {
      name: '',
      email: '',
    },
  ],
};

export type InitialValuesType = typeof initialValues;

const App = () => {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(
        values: InitialValuesType,
        { setSubmitting }: FormikHelpers<InitialValuesType>
      ) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          setSubmitting(false);
        }, 500);
      }}
    >
      <Form>
        <WithUseFormikContext />
        <WatchFieldWithUseFormikSelector name="firstName" />
        <label htmlFor="firstName">First Name</label>
        <Field name="firstName" placeholder="Jane" as={Input} />
        <div>
          <ButtonSetFieldError name={`firstName`} />
          <ErrorMessage
            name={`firstName`}
            component="div"
            className="field-error"
          />
        </div>

        <div>
          <WatchFieldWithUseField name="lastName" />
          <label htmlFor="lastName">Last Name</label>
          <InputWithUseField name="lastName" />
        </div>
        <label htmlFor="email">Email</label>
        <Field
          id="email"
          name="email"
          placeholder="john@acme.com"
          type="email"
          as={InputWithIsSubmitting}
        />

        <WithFieldArray />

        <p>
          <button type="submit">Submit</button>
        </p>

        <Debug />
      </Form>
    </Formik>
  );
};

export default App;
