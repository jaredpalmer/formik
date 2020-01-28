import React from 'react';
import { Formik, Field, Form, FormikHelpers } from '../src/.';
import formatString from 'format-string-by-pattern';

export default {
  title: 'Welcome',
};

interface Values {
  firstName: string;
  lastName: string;
  email: string;
}

export const Basic: React.FC<{}> = () => (
  <div>
    <h1>Signup</h1>
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
      }}
      onSubmit={(values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          setSubmitting(false);
        }, 500);
      }}
      render={({ values }) => (
        <Form>
          <label htmlFor="firstName">First Name</label>
          <Field id="firstName" name="firstName" placeholder="John" />

          <label htmlFor="lastName">Last Name</label>
          <Field id="lastName" name="lastName" placeholder="Doe" />

          <label htmlFor="email">Email</label>
          <Field
            id="email"
            name="email"
            placeholder="john@acme.com"
            type="email"
          />

          <button type="submit">Submit</button>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </Form>
      )}
    />
  </div>
);

(Basic as any).story = {
  name: 'basic',
};

export interface MaskingProps {}

const masks = [
  { name: 'phone-1', parse: '999-999-9999' },
  { name: 'phone-2', parse: '(999) 999-9999' },
  { name: 'phone-3', parse: '+49 (AAAA) BBBBBB' },
  { name: 'cep 🇧🇷', parse: '12345-678' },
  { name: 'cpf 🇧🇷', parse: 'XXX.XXX.XXX-XX' },
  { name: 'cnpj 🇧🇷', parse: 'XX.XXX.XXX/XXXX-XX' },
];
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const Masking: React.FC<MaskingProps> = () => {
  return (
    <div>
      <h1>Signup</h1>
      <Formik
        initialValues={masks.reduce((prev, curr) => {
          prev[curr.name] = '';
          return prev;
        }, {} as any)}
        onSubmit={async values => {
          sleep(500);
          alert(JSON.stringify(values, null, 2));
        }}
        render={({ values }) => (
          <Form>
            {masks.map(mask => (
              <div key={mask.name}>
                <label>{mask.name}</label>
                <Field
                  component="input"
                  name={mask.name}
                  parse={formatString(mask.parse)}
                  placeholder={mask.parse}
                />
              </div>
            ))}

            <button type="submit">Submit</button>
            <pre>{JSON.stringify(values, null, 2)}</pre>
          </Form>
        )}
      />
    </div>
  );
};

Masking.story = {
  name: 'Masking',
};
