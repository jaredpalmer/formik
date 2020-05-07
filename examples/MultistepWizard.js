import React, { useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { render } from "react-dom";
import * as Yup from "yup";
import { Debug } from './Debug';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Wizard is a single Formik instance whose children are each page of the
// multi-step form. The form is submitted on each forward transition (can only
// progress with valid input), whereas a backwards step is allowed with
// incomplete data. A snapshot of form state is used as initialValues after each
// transition. Each page has an optional submit handler, and the top-level
// submit is called when the final page is submitted.
const Wizard = ({ children, initialValues, onSubmit }) => {
  const [stepNumber, setStepNumber] = useState(0);
  const steps = React.Children.toArray(children);
  const [snapshot, setSnapshot] = useState(initialValues);

  const step = steps[stepNumber];
  const totalSteps = steps.length;
  const isLastStep = stepNumber === totalSteps - 1;

  const next = values => {
    setSnapshot(values);
    setStepNumber(Math.min(stepNumber + 1, totalSteps - 1));
  };

  const previous = values => {
    setSnapshot(values);
    setStepNumber(Math.max(stepNumber - 1, 0));
  };

  const handleSubmit = async (values, bag) => {
    if (step.props.onSubmit) {
      await step.props.onSubmit(values, bag);
    }
    if (isLastStep) {
      return onSubmit(values, bag);
    } else {
      bag.setTouched({});
      next(values);
    }
  };

  return (
    <Formik
      initialValues={snapshot}
      onSubmit={handleSubmit}
      validationSchema={step.props.validationSchema}
    >
      {formik => (
        <Form>
          <p>
            Step {stepNumber + 1} of {totalSteps}
          </p>
          {step}
          <div style={{ display: "flex" }}>
            {stepNumber > 0 && (
              <button onClick={() => previous(formik.values)} type="button">
                Back
              </button>
            )}
            <div>
              <button disabled={formik.isSubmitting} type="submit">
                {isLastStep ? "Submit" : "Next"}
              </button>
            </div>
          </div>
          <Debug/>
        </Form>
      )}
    </Formik>
  );
};

const WizardStep = ({ children }) => children;

const App = () => (
  <div>
    <h1>Formik Multistep Wizard</h1>
    <Wizard
      initialValues={{
        email: "",
        firstName: "",
        lastName: ""
      }}
      onSubmit={async values =>
        sleep(300).then(() => console.log("Wizard submit", values))
      }
    >
      <WizardStep
        onSubmit={() => console.log("Step1 onSubmit")}
        validationSchema={Yup.object({
          firstName: Yup.string().required("required"),
          lastName: Yup.string().required("required")
        })}
      >
        <div>
          <label htmlFor="firstName">First Name</label>
          <Field
            autoComplete="given-name"
            component="input"
            id="firstName"
            name="firstName"
            placeholder="First Name"
            type="text"
          />
          <ErrorMessage className="error" component="div" name="firstName" />
        </div>
        <div>
          <label htmlFor="lastName">Last Name</label>
          <Field
            autoComplete="family-name"
            component="input"
            id="lastName"
            name="lastName"
            placeholder="Last Name"
            type="text"
          />
          <ErrorMessage className="error" component="div" name="lastName" />
        </div>
      </WizardStep>
      <WizardStep
        onSubmit={() => console.log("Step2 onSubmit")}
        validationSchema={Yup.object({
          email: Yup.string()
            .email("Invalid email address")
            .required("required")
        })}
      >
        <div>
          <label htmlFor="email">Email</label>
          <Field
            autoComplete="email"
            component="input"
            id="email"
            name="email"
            placeholder="Email"
            type="text"
          />
          <ErrorMessage className="error" component="div" name="email" />
        </div>
      </WizardStep>
    </Wizard>
  </div>
);

export default App;
