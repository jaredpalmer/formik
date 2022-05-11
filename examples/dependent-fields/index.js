import React from 'react';
import ReactDOM from 'react-dom';
import { Formik, Field, Form, useField, useFormikContext } from 'formik';
import './styles.css';

const MyField = (props) => {
  const {
    values: { textA, textB },
    touched,
    setFieldValue,
  } = useFormikContext();
  const [field, meta] = useField(props);

  React.useEffect(() => {
    // set the value of textC, based on textA and textB
    if (
      textA.trim() !== '' &&
      textB.trim() !== '' &&
      touched.textA &&
      touched.textB
    ) {
      setFieldValue(props.name, `textA: ${textA}, textB: ${textB}`);
    }
  }, [textB, textA, touched.textA, touched.textB, setFieldValue, props.name]);

  return (
    <>
      <input {...props} {...field} />
      {!!meta.touched && !!meta.error && <div>{meta.error}</div>}
    </>
  );
};

function App() {
  // Note that we provide initalValues all 3 fields.
  const initialValues = { textA: '', textB: '', textC: '' };
  return (
    <div className="App">
      <Formik
        initialValues={initialValues}
        onSubmit={async (values) => alert(JSON.stringify(values, null, 2))}
      >
        <div className="section">
          <h1>Dependent Formik Field Example</h1>
          <p style={{ color: '#555' }}>
            This is an example of how to set the value of one field based on the
            current values of other fields in Formik v2. In form below, textC's
            value is set based on the current values of fields textA and textB.
          </p>
          <div>
            <small>
              <em>
                Instructions: enter values for textA, and textB, and then watch
                textC.
              </em>
            </small>
          </div>
          <Form>
            <label>
              textA
              <Field name="textA" />
            </label>
            <label>
              textB
              <Field name="textB" />
            </label>
            <label>
              textC
              <MyField name="textC" />
            </label>
            <button type="submit">Submit</button>
          </Form>
        </div>
      </Formik>
      <div style={{ marginTop: 16 }}>
        Notice the following:
        <ul>
          <li>
            textC's value is set after fields textA and textB have been touched
            and if they are not empty.
          </li>
          <li>
            textC is <i>still</i> editable after being set programmatically.
            However, the value will be overwritten if/whenever there are (new)
            changes to textA and textB. This is because of the dependency array
            in our custom field's React.useEffect; it only runs when textA or
            textB change or have been touched. Since Formik's `setFieldValue` is
            equivalent between renders and so is the field's name prop, this
            works as expected. You could alter this overrwriting behavior by
            keeping track of whether textC was been updated by field.onChange or
            useEffect. This might be very useful if you want to alert the end
            user that their changes to textC will be lost.
          </li>
        </ul>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
