import React from 'react';
import ReactDOM from 'react-dom';
import { Formik, Field, Form } from 'formik';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const Example = () => {
  return (
    <div>
      <Formik
        initialValues={{
          username: '',
        }}
        onSubmit={async (values) => {
          await sleep(500);
          alert(JSON.stringify(values, null, 2));
        }}
      >
        {({ values }) => (
          <Form>
            <label htmlFor="username">Username</label>
            <Field
              id="username"
              name="username"
              parse={(value) => value && value.toUpperCase()}
              format={(value) => (value ? value.toLowerCase() : '')}
            />

            <button type="submit">Submit</button>
            <pre>{JSON.stringify(values, null, 2)}</pre>
          </Form>
        )}
      </Formik>
    </div>
  );
};

ReactDOM.render(<Example />, document.getElementById('root'));
