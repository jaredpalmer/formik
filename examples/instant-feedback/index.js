import React from 'react';
import ReactDOM from 'react-dom';
import { useFormik, FormikProvider, Form, useField } from 'formik';
import './style.css';
import * as Yup from 'yup';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const TextInputLiveFeedback = ({ label, ...props }) => {
  const [field, meta] = useField(props);

  // Show inline feedback if the input is in focus
  // and value is longer than 2 charactersor or has been visited
  const [didFocus, setDidFocus] = React.useState(false);
  const handleFocus = () => setDidFocus(true);
  const showFeedback =
    (!!didFocus && field.value.trim().length > 2) || meta.touched;

  return (
    <div
      className={`form-control ${
        showFeedback ? (meta.error ? 'invalid' : 'valid') : ''
      }`}
    >
      <div className="flex items-center space-between">
        <label style={{ display: 'block' }} htmlFor={props.id}>
          {label}
        </label>{' '}
        {showFeedback ? (
          <div
            id={`${props.id}-feedback`}
            aria-live="polite"
            className="feedback text-sm"
          >
            {meta.error ? meta.error : '✓'}
          </div>
        ) : null}
      </div>
      <input
        {...props}
        {...field}
        aria-describedby={`${props.id}-feedback`}
        onFocus={handleFocus}
      />
      <div className="text-xs">{props.helpText}</div>
    </div>
  );
};

const Example = () => {
  const formik = useFormik({
    initialValues: {
      username: '',
    },
    onSubmit: async values => {
      await sleep(500);
      alert(JSON.stringify(values, null, 2));
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(8, 'Must be at least 8 characters')
        .max(20, 'Must be less  than 20 characters')
        .required('Username is required')
        .matches(
          /^[a-zA-Z0-9]+$/,
          'Cannot contain special characters or spaces'
        ),
    }),
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <TextInputLiveFeedback
          label="Username"
          id="username"
          name="username"
          helpText="Must be 8-20 characters and cannot contain special characters."
          type="text"
        />
        <div>
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
        </div>
      </Form>
    </FormikProvider>
  );
};

ReactDOM.render(
  <div className="app">
    <h1 className="text-4xl">Accessible instant feeback with Formik 2.x</h1>
    <p className="text-lg">
      Instant feedback during typing can be extremely helpful in certain
      situations. For example, checking the validity (or availability) of a
      username shouldn't require the user to resubmit the form (multiple times).
      Providing instant feedback while users are typing can allow them to
      experiment more easily until they find valid input value (like a suitable
      username). Note: This isn't always optimal, use your judgement.
    </p>
    <div className="example">
      <Example />
    </div>
    <p className="text-md mt-1">
      <strong>Note:</strong> The displayed feedback message in this example is
      coded using a <code>{`<div>`}</code> element that has an{' '}
      <code>{`aria-live`}</code> attribute with the value <code>polite</code>.
      The contents of this so called "live region" are conveyed to screen
      readers and other assistive technology. The value "polite" de-emphasizes
      the importance of the message and does not cause screen readers to
      interrupt their current tasks to read aloud this message. Thus the message
      is only read once when the user stops typing rather than on every
      keystroke that the user makes.
    </p>
    <p className="text-sm">
      <i>
        Example adapted from{' '}
        <a
          href="https://www.w3.org/WAI/tutorials/forms/notifications/"
          target="blank"
          rel="noopener noreferrer"
        >
          W3C WAI Web Accessibility Tutorials
        </a>
      </i>
    </p>
  </div>,
  document.getElementById('root')
);
