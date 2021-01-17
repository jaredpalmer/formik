import React, { ReactChildren } from 'react';
import { Formik, Form, useField, UseFieldProps } from '@formik/reducer-refs';

const Input = (p: UseFieldProps<string>) => {
  const [field, meta] = useField(p);
  const renders = React.useRef(0);
  return (
    <>
      <label>{p.name} </label>
      <input {...field} />
      <div>{renders.current++}</div>
      {meta.touched && meta.error ? <div>{meta.error.toString()}</div> : null}
      <small>
        <pre>{JSON.stringify(meta, null, 2)}</pre>
      </small>
    </>
  );
};

const isRequired = (v: string) => {
  return v && v.trim() !== '' ? undefined : 'Required';
};

const array = new Array(498).fill(undefined);

const initialValues = array.reduce((prev, _curr, idx) => {
  prev[`Input ${idx}`] = '';
  return prev;
}, {});

const onSubmit = async (values: typeof initialValues) => {
  await new Promise(r => setTimeout(r, 500));
  alert(JSON.stringify(values, null, 2));
};

const Collapse: React.FC = props => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div>
      <button type="button" onClick={() => setCollapsed(!collapsed)}>
        Collapse
      </button>
      <div
        style={{
          overflow: 'hidden',
          height: collapsed ? 0 : 'auto',
        }}
      >
        {props.children}
      </div>
    </div>
  );
};

const kids = array.map((_, i) => (
  <Input key={`input-${i}`} name={'Input'} validate={isRequired} />
));

export default function App() {
  return (
    <div>
      <div>
        <h1>
          <code>@formik/reducer-refs</code> with 500 of the same field
        </h1>
        <div>
          <span>#</span> = number of renders
        </div>
      </div>
      <Formik onSubmit={onSubmit} initialValues={initialValues}>
        <Form>
          <Input name={'Input'} validate={isRequired} />
          <Collapse>{kids}</Collapse>
          <Input name={'Input'} validate={isRequired} />

          <button type="submit">Submit</button>
        </Form>
      </Formik>
    </div>
  );
}
