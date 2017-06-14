import * as React from 'react';
import * as yup from 'yup';

import Formik, { InjectedFormikProps } from 'formik';

export interface FormFixtureProps {
  email: string;
  firstName: string;
  social: {
    facebook: string;
  };
}

interface FormFixtureState {
  email: string;
  firstName: string;
  facebook: string;
}

interface FormFixturePayload {
  data: FormFixtureState;
}

function Form({
  onSubmit,
  email,
  firstName,
  facebook,
  onChange,
}: FormFixtureState & InjectedFormikProps) {
  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        name="email"
        value={email}
        onChange={onChange}
        placeholder="john@apple.com"
      />
      <input
        type="text"
        name="firstName"
        value={firstName}
        onChange={onChange}
        placeholder="John"
      />
      <input
        type="text"
        name="facebook"
        value={facebook}
        onChange={onChange}
        placeholder="facebook username"
      />
    </form>
  );
}

export default Formik<FormFixtureProps, FormFixtureState, FormFixturePayload>({
  displayName: 'TestForm',
  mapPropsToFormState: ({ email, firstName, social }) => ({
    email,
    firstName,
    ...social,
  }),
  mapFormStateToPayload: formState => ({ data: formState }),
  handleSubmit: payload => {
    console.log(payload);
  },
  validationSchema: yup.object().shape({
    validationSchema: yup.object().shape({
      email: yup.string().email().min(5).required(),
      password: yup.string().min(5).required(),
    }),
  }),
})(Form);
