/**
 * @component TestSubmit
 * @description
 * A styled React Form component using Formik and Yup for form state management and validation.
 * This form includes two fields: Email and Age, both of which are required.
 *
 * Features:
 * - Email validation using Yup's `.email()` and `.required()` rules.
 * - Age validation that ensures:
 *    - the input is numeric (transforms empty string to NaN),
 *    - it's a whole number (integer),
 *    - it's positive,
 *    - and it's required.
 * - Inline styles for a clean and modern appearance.
 * - Error messages shown below each field using <ErrorMessage>.
 * - Debug info (`isValid`, `touched`, `errors`) displayed using <pre> block.
 * - Form resets on successful submission.
 *
 * @usage
 * <TestSubmit />
 *
 * @note
 * - Age input uses Yup's `.transform()` to handle empty strings correctly, ensuring validation works with edge cases like decimal input.
 * - All logic is contained in a single component for simplicity.
 */



import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation Schema
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  age: Yup.number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? NaN : Number(originalValue)
    )
    .typeError('Age must be a number')
    .integer('Age must be a whole number')
    .positive('Age must be a positive number')
    .required('Age is required'),
});

const styles = {
  formContainer: {
    maxWidth: '400px',
    margin: '40px auto',
    padding: '24px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    backgroundColor: '#f9f9f9',
  },
  fieldGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  errorText: {
    color: 'red',
    fontSize: '12px',
    marginTop: '4px',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

const TestSubmit = () => {
  return (
    <Formik
      initialValues={{ email: '', age: '' }}
      validationSchema={validationSchema}
      onSubmit={(values, { resetForm }) => {
        console.log('✅ Form submitted successfully:', values);
        alert('Form submitted successfully');
        resetForm();
      }}
    >
      {({ isValid, touched, errors }) => (
       <Form style={styles.formContainer}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email:</label>
            <Field name="email" type="email" style={styles.input} />
            <ErrorMessage name="email">
  {msg => <div style={styles.errorText}>{msg}</div>}
</ErrorMessage>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Age:</label>
            <Field name="age" type="number" style={styles.input} />
            <ErrorMessage name="age">
  {msg => <div style={styles.errorText}>{msg}</div>}
</ErrorMessage>
          </div>

          <button type="submit" style={styles.submitButton}>
            Submit
          </button>

          {/* Debug output */}
          <pre>{JSON.stringify({ isValid, touched, errors }, null, 2)}</pre>
        </Form>
      )}
    </Formik>
  );
};

export default TestSubmit;
