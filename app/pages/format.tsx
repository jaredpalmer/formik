import React from 'react';
import { Formik, Field, Form } from 'formik';
import formatString from 'format-string-by-pattern';

const masks = [
  { name: 'phone-1', parse: '999-999-9999' },
  { name: 'phone-2', parse: '(999) 999-9999' },
  { name: 'phone-3', parse: '+49 (AAAA) BBBBBB' },
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function Example() {
  return (
    <div>
      <Formik
        initialValues={masks.reduce((prev, curr) => {
          prev[curr.name] = '';
          return prev;
        }, {} as any)}
        onSubmit={async values => {
          await sleep(300);
          alert(JSON.stringify(values, null, 2));
        }}
      >
        <Form>
          {masks.map(mask => (
            <div key={mask.name}>
              <label>
                {mask.name}
                <Field
                  name={mask.name}
                  type="text"
                  parse={formatString(mask.parse)}
                  placeholder={mask.parse}
                />
              </label>
            </div>
          ))}

          <button type="submit">Submit</button>
        </Form>
      </Formik>
    </div>
  );
}
