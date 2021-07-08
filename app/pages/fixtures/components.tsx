import * as React from 'react';
import { Formik, Field, Form, FieldProps } from 'formik';
import { DebugProps } from '../../components/debugging/DebugProps';

const initialValues = {
  name: '',
};

const RenderComponent = (props: FieldProps<string, typeof initialValues>) => (
  <>
    <input data-testid="child" {...props.field} />
    <DebugProps {...props} />
  </>
);
const ComponentComponent = (
  props: FieldProps<string, typeof initialValues>
) => (
  <>
    <input data-testid="child" {...props.field} />
    <DebugProps {...props} />
  </>
);
const AsComponent = (
  props: FieldProps<string, typeof initialValues>['field']
) => (
  <>
    <input data-testid="child" {...props} />
    <DebugProps {...props} />
  </>
);

const ComponentsPage = () => (
  <div>
    <h1>Test Components</h1>
    <Formik
      initialValues={initialValues}
      validate={values => {
        console.log(values);
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

export default ComponentsPage;
