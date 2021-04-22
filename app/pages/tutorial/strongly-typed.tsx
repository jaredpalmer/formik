import React, { ChangeEvent, ChangeEventHandler, EventHandler } from 'react';
import { Formik, Form, ErrorMessage, createTypedField, Field, TypedAsField, FormatFn, useFormikContext, NameOf, FieldAsProps, FieldValue, ParseFn } from 'formik';
import * as Yup from 'yup';

let renderCount = 0;

type FormValues = {
  firstName: string,
  lastName: string,
  email: string,
  age: number | '',
  toggle: boolean,
  checked: string[],
  picked: number | '',
  textarea: string,
}

const initialValues: FormValues = {
  firstName: '',
  lastName: '',
  email: '',
  age: 21,
  toggle: false,
  checked: [],
  picked: '',
  textarea: '',
};

const TypedField = createTypedField<FormValues>();

const NumberField = <Values, Path extends NameOf<Values>>(props: FieldAsProps<number | "", Values, Path, { required: boolean }>) => {
  const formik = useFormikContext<Values>();

  const parse: ParseFn<number | ""> = React.useMemo(
    () => props.parse ?? ((value: unknown) => value === "" ? "" : Number(value)),
    [props.format]
  );
  const format = React.useMemo(
    () => props.format ?? ((value: number | '') => Number(value) ? value.toLocaleString() : ""),
    [props.format]
  );
  const handleChange = React.useCallback<ChangeEventHandler<HTMLInputElement>>(event => {
    formik.setFieldValue(props.name, parse(event.target.value, props.name));
  }, [parse])

  return <input name={props.name} value={format(props.value)} onChange={handleChange} onBlur={props.onBlur} />
};

const Basic = () => (
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
        <TypedField
          name="firstName"
          placeholder="Jane"
        />
        <ErrorMessage name="firstName" component="p" />

        <TypedField name="lastName" placeholder="Doe" />
        <ErrorMessage name="lastName" component="p" />

        <TypedField
          id="email"
          name="email"
          placeholder="jane@acme.com"
          type="email"
        />
        <ErrorMessage name="email" component="p" />

        <TypedField
          id="age"
          name="age"
          placeholder="jane@acme.com"
          type="number"
          validate={numlike =>
            numlike === ""
              ? "not a number"
              : numlike === 0
                ? "higher!!"
                : ""
          }
          value={21}
        />

        <label>
          <TypedField type="checkbox" name="toggle" />
          <span style={{ marginLeft: 3 }}>Toggle</span>
        </label>

        <div id="checkbox-group">Checkbox Group </div>
        <div role="group" aria-labelledby="checkbox-group">
          <label>
            <TypedField type="checkbox" name="checked" value="One" />
            One
          </label>
          <label>
            <TypedField type="checkbox" name="checked" value="Two" />
            Two
          </label>
          <label>
            <TypedField type="checkbox" name="checked" value="Three" />
            Three
          </label>
        </div>
        <div id="my-radio-group">Picked</div>
        <div role="group" aria-labelledby="my-radio-group">
          <label>
            <TypedField type="radio" name="picked" value={1} />
            One
          </label>
          <label>
            <TypedField type="radio" name="picked" value={2} />
            Two
          </label>
        </div>
        <div>
          <label>
            Textarea
            <TypedField name="textarea" as="textarea" validate={value => {}} />
          </label>
        </div>
        <button type="submit">Submit</button>
        <div id="renderCounter">{renderCount++}</div>
      </Form>
    </Formik>
  </div>
);

export default Basic;
