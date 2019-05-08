import React from 'react';
import { Formik, Field, Form } from 'formik';
import { Debug } from './Debug';

const FieldLevelInitialValue = () => (
    <div>
        <h1>Field level initial value</h1>
        <Formik
          initialValues={{
              name: 'foo',
              email: 'hello@me.com',
          }}
          enableReinitialize
          render={({ setInitialValues }) => (
            <Form>
              <label htmlFor="name">Name</label>
              <Field name="name" type="text" initialValue="bar" />

              <label htmlFor="email">Email</label>
              <Field name="email" type="email" />

              <button
                onClick={() =>
                  setInitialValues({
                    name: 'zebra',
                    email: 'zebra@me.com',
                  })
                }
              >
                rename
              </button>

              <Debug />

            </Form>
          )}
        />
    </div>
);

export default FieldLevelInitialValue;
