import React from "react";
import { Formik, Form, useField } from "formik";

const Input = (p) => {
  const [field, meta] = useField(p);
  const renders = React.useRef(0);
  return (
    <>
      <label>{p.name} </label>
      <input {...field} />
      <div>{renders.current++}</div>
      {meta.touched && meta.error ? (
        <div>{meta.error}</div>
      ) : null}
      <small>
        <pre>{JSON.stringify(meta, null, 2)}</pre>
      </small>
    </>
  );
};

const isRequired = (v) => {
  return v && v.trim() !== "" ? undefined : "Required";
};

const array = new Array(500).fill();

const initialValues = array.reduce((prev, curr, idx) => {
  prev[`Input ${idx}`] = "";
  return prev;
}, {});

const onSubmit = async (values) => {
  await new Promise((r) => setTimeout(r, 500));
  alert(JSON.stringify(values, null, 2));
};

const kids = array.map((_, i) => (
  <Input key={`input-${i}`} name={`Input ${i}`} validate={isRequired} />
));

export default function App() {
  return (
    <div>
      <div>
        <h1>Formik v3 with 500 controlled fields</h1>
        <div>
          <span>#</span> = number of renders
        </div>
      </div>
      <Formik onSubmit={onSubmit} initialValues={initialValues}>
        <Form >
          {kids}
          <button type="submit" >
            Submit
          </button>
        </Form>
      </Formik>
    </div>
  );
}
