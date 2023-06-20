import Benchmark from 'benchmark';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Field, FieldArray, Form, Formik } from 'formik';
import * as yup from 'yup';

const suite = new Benchmark.Suite({ initCount: 50 });

suite
  .add('formik simple form', () => renderToString(<FormikSimpleForm />))
  // TODO: add react-hook-form variant to cross-test
  .on('cycle', (event: Benchmark.Event) => {
    // @ts-expect-error surface execution errors, type does not include "error" field
    if (event.target.error) throw event.target.error;

    // Output benchmark result by converting benchmark result to string
    console.log(JSON.stringify(event.target));
  })
  .run();

const schema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email().required(),
  guests: yup.array(yup.object({ name: yup.string().required() })).ensure(),
});

// generic Formik implementation
function FormikSimpleForm() {
  return (
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
        guests: [],
      }}
      onSubmit={() => {}}
      validationSchema={schema}
    >
      {({ values }) => (
        <Form>
          <Field name="firstName" />
          <Field name="lastName" />
          <Field name="email" />

          <FieldArray name="guests">
            {({ push, remove }) => (
              <>
                {values.guests.map((_, index) => (
                  <div>
                    <Field name={`guests[${index}].name`} />{' '}
                    <button onClick={() => remove(index)}>Remove</button>
                  </div>
                ))}

                <button onClick={() => push({ name: '' })}>Add guest</button>
              </>
            )}
          </FieldArray>
        </Form>
      )}
    </Formik>
  );
}
