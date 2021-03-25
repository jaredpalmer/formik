import * as React from 'react';
import { Formik, Form, useField, useFormikState, FormikState, useFormikConfig, FieldConfig } from 'formik';
import { DebugProps } from 'app/components/debugging/DebugProps';

const Input = React.memo((p: FieldConfig<string>) => {
  const [field, meta] = useField(p);

  const renders = React.useRef(0);
  const committedRenders = React.useRef(0);
  React.useLayoutEffect(() => {
    committedRenders.current++;
  });
  return (
    <>
      <label>{p.name} </label>
      <input {...field} />
      <div>
        {renders.current++}, {committedRenders.current}
      </div>
      {meta.touched && meta.error ? <div>{meta.error.toString()}</div> : null}
      <small>
        <pre>{JSON.stringify(meta, null, 2)}</pre>
      </small>
    </>
  );
});

const initialValues = {
  name: "",
}

const onSubmit = () => {};

const ValidationStatus = () => {
  const [isValidating] = useFormikState(
    React.useMemo(
      () => (state: FormikState<any>) => state.isValidating,
      []
    )
  );
  const validateOnChange = useFormikConfig().validateOnChange;

  return <DebugProps isValidating={isValidating} validateOnChange={validateOnChange} />
}

const validateInput = (value: any) => new Promise<string>(resolve => setTimeout(() => resolve(value ? "" : "Please enter a name."), 500))

const Perf500Page = () => {
  const [validateOnChange, setValidateOnChange] = React.useState(false);
  const updateValidateOnChange = React.useCallback(
    () => setValidateOnChange(value => !value),
    []
  );

  return (
    <div>
      <div>
        <h1>Formik Config Test</h1>
        <div>
          <p>Updating validateOnChange should not cause the field to render.</p>
          <p>The field should correctly validateOnChange when true, and not when false.</p>
          <span>#, #</span> = number of renders, number of committed renders
        </div>
      </div>
      <Formik onSubmit={onSubmit} initialValues={initialValues} validateOnChange={validateOnChange}>
        <Form>
          <button type="button" onClick={updateValidateOnChange}>Update validateOnChange</button>
          <ValidationStatus />
          <Input name="name" validate={validateInput} />
        </Form>
      </Formik>
    </div>
  );
}

export default Perf500Page;