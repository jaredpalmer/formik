import { yupResolver } from '@hookform/resolvers/yup';
import Benchmark from 'benchmark';
import { Field, FieldArray, Form, Formik } from 'formik';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { useFieldArray, useForm } from 'react-hook-form';
import * as yup from 'yup';

const schema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email().required(),
  guests: yup.array(yup.object({ name: yup.string().required() })).ensure(),
});

const suite = new Benchmark.Suite({ initCount: 50 });

suite
  .add('formik (simple example)', () => renderToString(<FormikSimpleExample />))
  .add('react hook form (simple example)', () =>
    renderToString(<ReactHookFormSimpleExample />)
  )
  // TODO: add react-hook-form variant to cross-test
  .on('cycle', (event: Benchmark.Event) => {
    // @ts-expect-error surface execution errors, type does not include "error" field
    if (event.target.error) throw event.target.error;

    // Output benchmark result by converting benchmark result to string
    console.log(String(event.target));
  })
  .run();

// generic Formik implementation
function FormikSimpleExample() {
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
                  <div key={index}>
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

// generic react-hook-form implementation
function ReactHookFormSimpleExample() {
  const { control, register, handleSubmit } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      guests: [],
    },
    resolver: yupResolver(schema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    // @ts-expect-error incorrect schema resolution in library types
    name: 'guests',
  });

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <input {...register('firstName')} />
      <input {...register('lastName')} />
      <input {...register('email')} />

      <>
        {fields.map((field, index) => (
          <div key={field.id}>
            <input
              {...register(
                // @ts-expect-error incorrect schema resolution in library types
                `guests.${index}.name`
              )}
            />{' '}
            <button onClick={() => remove(index)}>Remove</button>
          </div>
        ))}

        <button onClick={() => append({ name: '' })}>Add guest</button>
      </>
    </form>
  );
}
