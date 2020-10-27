import React from 'react';
import ReactDOM from 'react-dom';
import { Formik, Field, Form } from 'formik';
import formatString from 'format-string-by-pattern';

const masks = [
  { name: 'phone-1', parse: '999-999-9999' },
  { name: 'phone-2', parse: '(999) 999-9999' },
  { name: 'phone-3', parse: '+49 (AAAA) BBBBBB' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const Example = () => {
  return (
    <div>
      <Formik
        initialValues={masks.reduce((prev, curr) => {
          prev[curr.name] = '';
          return prev;
        }, {})}
        onSubmit={async (values) => {
          await sleep(500);
          alert(JSON.stringify(values, null, 2));
        }}
      >
        <Form>
          {masks.map((mask) => (
            <div key={mask.name}>
              <label>
                {mask.name}
                <Field
                  name={mask.name}
                  parse={formatString(mask.parse)}
                  placeholder={mask.parse}
                />
              </label>
            </div>
          ))}

          <button type="submit">Submit</button>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </Form>
        )}
      </Formik>
    </div>
  );
};

ReactDOM.render(<Example />, document.getElementById('root'));
