import * as React from 'react';
import { Formik, Field, Form, FormikHelpers } from 'formik';

interface Values {
  firstName: string;
  lastName: string;
  email: string;
}

const mock1 = {
  firstName: '',
  lastName: '',
  email: '',
};
const mock2 = {
  firstName: 'john',
  lastName: 'snow',
  email: 'john@got.com',
};

const ReinitialValue: React.SFC<{}> = () => {
  const [initialValues, setInitialValues] = React.useState(mock1);
  const [title, setTitle] = React.useState('');

  React.useEffect(() => {
    setTitle('Fetching data... in 3s');
    setTimeout(() => {
      setInitialValues(mock2);
      setTitle('Fetched!');
    }, 3000);
  }, []);

  return (
    <div>
      <h1>{title}</h1>
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={(
          values: Values,
          { setSubmitting }: FormikHelpers<Values>
        ) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            setSubmitting(false);
          }, 500);
        }}
        render={() => (
          <Form>
            <label htmlFor="firstName">First Name</label>
            <Field id="firstName" name="firstName" placeholder="John" />

            <label htmlFor="lastName">Last Name</label>
            <Field id="lastName" name="lastName" placeholder="Doe" />

            <label htmlFor="email">Email</label>
            <Field
              id="email"
              name="email"
              placeholder="john@acme.com"
              type="email"
            />

            <button type="submit">Submit</button>
          </Form>
        )}
      />
    </div>
  );
};

export default ReinitialValue;
