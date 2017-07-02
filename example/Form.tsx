import * as React from 'react';
import * as yup from 'yup';

import { Formik, FormikBag, InjectedFormikProps } from 'formik';

export interface Props {
  email: string;
  firstName: string;
  social: {
    facebook: string;
  };
}

interface Values {
  email: string;
  firstName: string;
  facebook: string;
}

interface Payload {
  data: Values;
}

const FormikEnhancer = Formik<Props, Values, Payload>({
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
  handleSubmit: (
    payload: Payload,
    { setSubmitting }: FormikBag<Props, Values>
  ) => {
    callMyApi(payload).then(
      res => {
        setSubmitting(false);
        MyToast.show({
          message: 'Success!',
        });
      },
      err => {
        setSubmitting(false);
        MyToast.show({
          message: 'Error!',
        });
      }
    );
  },
});

function MyForm({
  handleSubmit,
  values: { email, firstName, facebook },
  handleChange,
}: InjectedFormikProps<Props, Values>) {
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="email"
        value={email}
        onChange={handleChange}
        placeholder="john@apple.com"
      />
      <input
        type="text"
        name="firstName"
        value={firstName}
        onChange={handleChange}
        placeholder="John"
      />
      <input
        type="text"
        name="facebook"
        value={facebook}
        onChange={handleChange}
        placeholder="facebook username"
      />
      <button type="submit">Submit</button>
    </form>
  );
}

export default FormikEnhancer(MyForm);
