import React from 'react';
import { Formik, FastField, Form } from 'formik';
import { unstable_trace as trace } from 'scheduler/tracing';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const onSubmit = async values => {
  await sleep(300);
  window.alert(JSON.stringify(values, 0, 2));
};

const Basic = ({ numFields = 200 }) => {
  const keys = [...Array(numFields).keys()];
  const initialValues = keys.reduce((prev, curr) => {
    prev['field' + curr] = '';
    return prev;
  }, {});
  return (
    <Formik onSubmit={onSubmit} initialValues={initialValues}>
      <Form>
        <h1>Formik v2.x - {numFields} controlled fields</h1>
        {keys.map(key => (
          <FastField name={`field${key}`} key={key}>
            {({ field }) => (
              <div>
                <label>Field {key}</label>
                <input
                  {...field}
                  onChange={event => {
                    trace('Change', performance.now(), () => {
                      field.onChange(event);
                    });
                  }}
                  placeholder={`Field ${key}`}
                />
              </div>
            )}
          </FastField>
        ))}
        <div className="buttons">
          <button type="submit">Submit</button>
        </div>
      </Form>
    </Formik>
  );
};

export default Basic;
