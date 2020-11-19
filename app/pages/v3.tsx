import React from 'react';
import {
  Formik,
  Form,
  useFormikContext,
  useField,
  UseFieldProps,
} from 'formik';
import formatString from 'format-string-by-pattern';

const masks = [
  { name: 'phone-1', type: 'old', parse: '999-999-9999' },
  { name: 'phone-2', type: 'new', parse: '(999) 999-9999' },
  { name: 'phone-3', type: 'new', parse: '+49 (AAAA) BBBBBB' },
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
let renderCounterOld = 0;

function CustomFieldOld(
  props: UseFieldProps<string> & { placeholder: string }
) {
  const [field] = useField(props as any);
  useFormikContext();
  return (
    <>
      <input {...(props as any)} {...field} />
      <span id={`render-${props.name}`}>{renderCounterOld++}</span>
    </>
  );
}

let renderCounterNew = 0;
function CustomFieldNew(
  props: UseFieldProps<string> & { placeholder: string }
) {
  const [field] = useField(props as any);
  return (
    <>
      <input {...(props as any)} {...field} />
      <span id={`render-${props.name}`}>{renderCounterNew++}</span>
    </>
  );
}

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
                {mask.name} : <small>{mask.type}</small>
                {mask.type === 'old' ? (
                  <CustomFieldOld
                    name={mask.name}
                    type="text"
                    parse={formatString(mask.parse)}
                    placeholder={mask.parse}
                  />
                ) : (
                  <CustomFieldNew
                    name={mask.name}
                    type="text"
                    parse={formatString(mask.parse)}
                    placeholder={mask.parse}
                  />
                )}
              </label>
            </div>
          ))}

          <button type="submit">Submit</button>
        </Form>
      </Formik>
    </div>
  );
}
