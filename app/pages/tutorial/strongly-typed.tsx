import React from 'react';
import {
  Formik,
  Form,
  ErrorMessage,
  Field,
} from 'formik';
import * as Yup from 'yup';
import { NumberAsField } from 'app/components/fields/number-as-field';
import { EmailFieldAsClass } from 'app/components/fields/email-field-as-class';
import { NumberComponentField } from 'app/components/fields/number-component-field';
import { createTypedFields } from 'app/components/fields';

let renderCount = 0;

interface NameValue {
  first: string,
  last: string,
}

type BasePerson = {
  name: NameValue,
  email: string,
  hasNicknames: boolean,
  nicknames: string[],
  favoriteFoods: string[],
  age: number | '',
  favoriteNumbers: (number | "")[];
  motto: string;
}

type FormValues = BasePerson & {
  partner: BasePerson;
  friends: BasePerson[];
}

const basePerson: BasePerson = {
  name: {
    first: "",
    last: "",
  },
  email: "",
  hasNicknames: false,
  nicknames: [],
  favoriteFoods: [],
  age: 21,
  favoriteNumbers: [],
  motto: "",
}

const initialValues: FormValues = {
  ...basePerson,
  partner: basePerson,
  friends: [
    basePerson,
    basePerson
  ]
};

const fields = createTypedFields<FormValues>();

const StronglyTypedPage = () => (
  <div>
    <h1>Sign Up</h1>
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        email: Yup.string().email('Invalid email address').required('Required'),
        firstName: Yup.string().required('Required'),
        lastName: Yup.string()
          .min(2, 'Must be longer than 2 characters')
          .max(20, 'Nice try, nobody has a last name that long')
          .required('Required'),
      })}
      onSubmit={async values => {
        await new Promise(r => setTimeout(r, 500));
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Form>
        <fields.Field
          name="name.first"
          placeholder="Jane"
        />
        <ErrorMessage<FormValues> name="name.first" component="p" />

        <fields.Field
          name="name.last"
          placeholder="Doe"
        />
        <ErrorMessage<FormValues> name="name.last" component="p" />

        <fields.Field
          name="email"
          as={EmailFieldAsClass}
          type="email"
        />
        <ErrorMessage<FormValues> name="email" component="p" />

        <fields.Field
          name="age"
          as={NumberAsField}
          type="number"
        />

        <fields.Field
         name="age"
        />

        <fields.NumberField
          name="favoriteNumbers.0"
          as={NumberAsField}
          type="number"
        />

        <fields.Field
          name="favoriteNumbers.0"
          as={NumberAsField}
          type="number"
        />

        <fields.Field
          name="friends.0.favoriteNumbers.0"
          component={NumberComponentField}
          type="number"
        />

        <label>
          <fields.Field type="checkbox" name="hasNicknames" />
          <span style={{ marginLeft: 3 }}>Toggle</span>
        </label>

        {/* todo: FieldArray for nicknames */}

        <div id="checkbox-group">Checkbox Group</div>
        <div role="group" aria-labelledby="checkbox-group">
          <label>
            <Field type="checkbox" name="favoriteFoods" value="Pizza" />
            Pizza
          </label>
          <label>
            <Field type="checkbox" name="favoriteFoods" value="Falafel" />
            Falafel
          </label>
          <label>
            <Field type="checkbox" name="favoriteFoods" value="Dim Sum" />
            Dim Sum
          </label>
        </div>
        <div id="my-radio-group">Picked</div>
        <div role="group" aria-labelledby="my-radio-group">
          <label>
            <Field type="radio" name="favoriteNumbers" value={1} />
            1
          </label>
          <label>
            <Field type="radio" name="favoriteNumbers" value={2} />
            2
          </label>
        </div>
        <div>
          <label>
            Textarea
            <fields.Field name="motto" as="textarea" />
          </label>
        </div>
        <button type="submit">Submit</button>
        <div id="renderCounter">{renderCount++}</div>
      </Form>
    </Formik>
  </div>
);

export default StronglyTypedPage;
