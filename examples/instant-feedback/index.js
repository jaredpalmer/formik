import React from "react";
import ReactDOM from "react-dom";
import { useFormik, FormikProvider, Form, useField } from "formik";
import "./styles.css";
import * as Yup from "yup";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TextInputLiveFeedback = ({ label, helpText, ...props }) => {
  const [field, meta] = useField(props);

  // Show inline feedback if EITHER
  // - the input is focused AND value is longer than 2 characters
  // - or, the has been visited (touched === true)
  const [didFocus, setDidFocus] = React.useState(false);
  const handleFocus = () => setDidFocus(true);
  const showFeedback =
    (!!didFocus && field.value.trim().length > 2) || meta.touched;

  return (
    <div
      className={`form-control ${
        showFeedback ? (meta.error ? "invalid" : "valid") : ""
      }`}
    >
      <div className="flex items-center space-between">
        <label htmlFor={props.id}>{label}</label>{" "}
        {showFeedback ? (
          <div
            id={`${props.id}-feedback`}
            aria-live="polite"
            className="feedback text-sm"
          >
            {meta.error ? meta.error : "✓"}
          </div>
        ) : null}
      </div>
      <input
        {...props}
        {...field}
        aria-describedby={`${props.id}-feedback ${props.id}-help`}
        onFocus={handleFocus}
      />
      <div className="text-xs" id={`${props.id}-help`} tabIndex="-1">
        {helpText}
      </div>
    </div>
  );
};

const Example = () => {
  const formik = useFormik({
    initialValues: {
      username: "",
      password: ""
    },
    onSubmit: async (values) => {
      await sleep(500);
      alert(JSON.stringify(values, null, 2));
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(8, "Must be at least 8 characters")
        .max(20, "Must be less  than 20 characters")
        .required("Username is required")
        .matches(
          /^[a-zA-Z0-9]+$/,
          "Cannot contain special characters or spaces"
        ),
      password: Yup.string()
        .min(8, "Must be at least 8 characters")
        .max(20, "Must be less  than 20 characters")
        .required("Password is required")
        .matches(
          /(?=.*[0-9])/,
          "Must contain a special character, or a number."
        )
    })
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <TextInputLiveFeedback
          label="Username"
          id="username"
          name="username"
          helpText="Must be 8-20 characters and CANNOT contain special characters."
          type="text"
        />
        <TextInputLiveFeedback
          label="Password"
          id="password"
          name="password"
          helpText="Must be 8-20 characters and MUST contain a special character or number."
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
    <h1 className="text-4xl">Remember Your Login</h1>
    <p className="text-lg">
      With different requirements on different pages, who can remember which
      version of your password is used on which site? By displaying the password
      requirements prior to login, you can be remindded that your 'Password1'
      won't work here. Oh, then you must have made the password 'Password1!'
      instead. No need to constantly reset them. Maybe if more forms acted like
      this, we'd not need to keep resetting them, and actually start remembering
      our passwords in the first place.
    </p>

    <div className="example">
      <Example />
    </div>
  </div>,
  document.getElementById("root")
);
