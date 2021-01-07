import React from 'react';
import { Formik, Field, Form, FieldProps, FieldComponentProps } from 'formik';
import { DisplayProps } from './debug/DisplayProps';

const initialValues = {
  name: '',
};

const RenderComponent = (props: FieldProps<string, typeof initialValues>) => (
  <>
    <input data-testid="child" {...props.field} />
    <DisplayProps {...props} />
  </>
);
const ComponentComponent = (
  props: FieldComponentProps<string, typeof initialValues>
) => (
  <>
    <input data-testid="child" {...props.field} />
    <DisplayProps {...props} />
  </>
);
const AsComponent = (
  props: FieldProps<string, typeof initialValues>['field']
) => (
  <>
    <input data-testid="child" {...props} />
    <DisplayProps {...props} />
  </>
);

const Basic = () => (
  <div>
    <h1>Test Components</h1>
    <Formik
      initialValues={initialValues}
      validate={values => {
        alert(`validated: ${JSON.stringify(values)}`);
      }}
      onSubmit={async values => {
        await new Promise(r => setTimeout(r, 500));
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Form>
        <Field name="name" children={RenderComponent} />
        <Field name="name" render={RenderComponent} />
        <Field name="name" component={ComponentComponent} />
        <Field name="name" as={AsComponent} />
        <button type="submit">Submit</button>
      </Form>
    </Formik>
  </div>
);

export default Basic;
