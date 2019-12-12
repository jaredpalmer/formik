import React from 'react';
import { Formik, Field, Form } from 'formik';
import { Debug } from './Debug';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const CheckboxExample = () => (
  <div>
    <h1>Checkboxes</h1>
    <p>
      This example demonstrates how to properly create checkboxes with Formik.
    </p>
    <Formik
      initialValues={{
        isAwesome: false,
        terms: false,
        newsletter: false,
        jobType: ['designer'],
        location: [],
      }}
      onSubmit={async values => {
        await sleep(1000);
        alert(JSON.stringify(values, null, 2));
      }}
    >
      {({ isSubmitting, getFieldProps, handleChange, handleBlur, values }) => (
        <Form>
          {/* 
            This first checkbox will result in a boolean value being stored.
          */}
          <div className="label">Basic Info</div>
          <label>
            <Field type="checkbox" name="isAwesome" />
            Are you awesome?
          </label>
          {/* 
            Multiple checkboxes with the same name attribute, but different
            value attributes will be considered a "checkbox group". Formik will automagically
            bind the checked values to a single array for your benefit. All the add and remove
            logic will be taken care of for you.
          */}
          <div className="label">
            What best describes you? (check all that apply)
          </div>
          <label>
            <Field type="checkbox" name="jobType" value="designer" />
            Designer
          </label>
          <label>
            <Field type="checkbox" name="jobType" value="developer" />
            Developer
          </label>
          <label>
            <Field type="checkbox" name="jobType" value="product" />
            Product Manager
          </label>
          {/*
           You do not _need_ to use <Field>/useField to get this behavior, 
           using handleChange, handleBlur, and values works as well. 
          */}
          <label>
            <input
              type="checkbox"
              name="jobType"
              value="founder"
              checked={values.jobType.includes('founder')}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            CEO / Founder
          </label>

          {/* 
           The <select> element will also behave the same way if 
           you pass `multiple` prop to it. 
          */}
          <label htmlFor="location">Where do you work?</label>
          <Field
            component="select"
            id="location"
            name="location"
            multiple={true}
          >
            <option value="NY">New York</option>
            <option value="SF">San Francisco</option>
            <option value="CH">Chicago</option>
            <option value="OTHER">Other</option>
          </Field>
          <label>
            <Field type="checkbox" name="terms" />I accept the terms and
            conditions.
          </label>
          {/* Here's how you can use a checkbox to show / hide another field */}
          {!!values.terms ? (
            <div>
              <label>
                <Field type="checkbox" name="newsletter" />
                Send me the newsletter{' '}
                <em style={{ color: 'rebeccapurple' }}>
                  (This is only shown if terms = true)
                </em>
              </label>
            </div>
          ) : null}
          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
          <Debug />
        </Form>
      )}
    </Formik>
  </div>
);

export default CheckboxExample;
