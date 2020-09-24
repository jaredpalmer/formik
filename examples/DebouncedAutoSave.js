import React from 'react';
import { useFormikContext, Formik, Field, Form } from 'formik';
import { Debug } from './Debug';
import debounce from 'just-debounce-it';

const AutoSave = ({ debounceMs }) => {
  const formik = useFormikContext();
  const [lastSaved, setLastSaved] = React.useState(null);
  const debouncedSubmit = React.useCallback(
    debounce(
      () =>
        formik.submitForm().then(() => setLastSaved(new Date().toISOString())),
      debounceMs
    ),
    [debounceMs, formik.submitForm]
  );

  React.useEffect(() => {
    debouncedSubmit();
  }, [debouncedSubmit, formik.values]);

  return (
    <>
      {!!formik.isSubmitting
        ? 'saving...'
        : lastSaved !== null
        ? `Last Saved: ${lastSaved}`
        : null}
    </>
  );
};

const AutoSavingForm = () => (
  <div>
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
      }}
      onSubmit={(values, { setSubmitting }) => {
        return new Promise(resolve =>
          setTimeout(() => {
            console.log('submitted', JSON.stringify(values, null, 2));
            setSubmitting(false);
            resolve();
          }, 1000)
        );
      }}
      render={() => (
        <Form>
          <h1>
            AutoSavingForm{' '}
            <small style={{ color: 'gray', fontSize: 11 }}>
              <AutoSave debounceMs={300} />
            </small>
          </h1>

          <label htmlFor="firstName">First Name</label>
          <Field name="firstName" placeholder="Jane" />

          <label htmlFor="lastName">Last Name</label>
          <Field name="lastName" placeholder="Doe" />

          <label htmlFor="email">Email</label>
          <Field name="email" placeholder="jane@acme.com" type="email" />
          <button type="submit">Submit</button>

          <Debug />
        </Form>
      )}
    />
  </div>
);

export default AutoSavingForm;
