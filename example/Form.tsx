import * as React from 'react';
import * as yup from 'yup';

import Formik, { InjectedFormikProps } from 'formik';

export interface FormProps {
  email: string;
  firstName: string;
  social: {
    facebook: string;
  };
}

interface FormValues {
  email: string;
  firstName: string;
  facebook: string;
}

interface FormPayload {
  data: FormValues;
}

function Form({
  onSubmit,
  values: { email, firstName, facebook },
  onChange,
}: InjectedFormikProps<FormValues>) {
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
      <button type="submit">Submit</button>
    </form>
  );
}

export default Formik<FormProps, FormValues, FormPayload>({
  displayName: 'TestForm',
  mapPropsToValues: ({ email, firstName, social }) => ({
    email,
    firstName,
    ...social,
  }),
  mapValuesToPayload: values => ({ data: values }),
  validationSchema: yup.object().shape({
    email: yup.string().email().min(5).required(),
    firstName: yup.string().min(5).required(),
    facebook: yup.string(),
  }),
  handleSubmit: (payload, { props, setSubmitting }) => {
    setSubmitting(true);
    callMyApi(payload)
      .then(res => {
        setSubmitting(false);
        MyToast.show({
          message: 'Success!'
        });
      }, err => => {
        setSubmitting(false);
        MyToast.show({
          message: 'Error!'
        });
      });
  },
 
})(Form as any);
