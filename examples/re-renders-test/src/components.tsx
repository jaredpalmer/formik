import React, { useRef } from 'react';
import {
  ErrorMessage,
  Field,
  FieldArray,
  useField,
  useFormikContext,
  useFormikSelector,
} from 'formik';
import { InitialValuesType } from './App';

export const RenderCount = ({ title }: { title: string }) => {
  const renderCountRef = useRef(0);
  return (
    <>
      {title} of renders: {renderCountRef.current++}
    </>
  );
};

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <>
      <input {...props} />
      <RenderCount title="Input" />
    </>
  );
};

export const InputWithIsSubmitting = (
  props: React.InputHTMLAttributes<HTMLInputElement>
) => {
  const isSubmitting = useFormikSelector<InitialValuesType>(
    ({ isSubmitting }) => isSubmitting
  ) as boolean;
  return (
    <>
      <input {...props} disabled={isSubmitting} />
      <RenderCount title="InputWithIsSubmitting" />
    </>
  );
};

export const InputWithUseField = ({ name }: { name: string }) => {
  const [field] = useField(name);
  return (
    <>
      <input {...field} placeholder={name} />
      <RenderCount title="InputWithUseField" />
    </>
  );
};

export const WithUseFormikContext = () => {
  const formik = useFormikContext();
  return (
    <p>
      <RenderCount title="WithUseFormikContext" />
    </p>
  );
};

export const WatchFieldWithUseFormikSelector = ({
  name,
}: {
  name: keyof InitialValuesType;
}) => {
  const value = useFormikSelector<InitialValuesType>(
    ({ values }) => values[name]
  );
  return (
    <div>
      <RenderCount
        title={`Watch with useFormikSelector: ${name}, value: ${value}`}
      />
    </div>
  );
};

export const WatchFieldWithUseField = ({
  name,
}: {
  name: keyof InitialValuesType;
}) => {
  const [{ value }] = useField(name);
  return (
    <div>
      <RenderCount title={`Watch with useField: ${name}, value: ${value}`} />
    </div>
  );
};

export const WithFieldArray = () => {
  return (
    <div>
      <h3>Invite friends</h3>

      <FieldArray name="friends">
        {({ remove, push, form: { values } }) => (
          <div>
            {values.friends.length > 0 &&
              (values as InitialValuesType).friends.map((friend, index) => {
                return (
                  <div key={index}>
                    <p>
                      <label htmlFor={`friends.${index}.name`}>Name</label>
                      <InputWithUseField name={`friends.${index}.name`} />
                      <ErrorMessage
                        name={`friends.${index}.name`}
                        component="div"
                        className="field-error"
                      />
                    </p>
                    <p>
                      <label htmlFor={`friends.${index}.email`}>Email</label>
                      <Field
                        name={`friends.${index}.email`}
                        placeholder="jane@acme.com"
                        type="email"
                        as={Input}
                      />
                      <ErrorMessage
                        name={`friends.${index}.email`}
                        component="div"
                        className="field-error"
                      />
                    </p>
                    <div>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => remove(index)}
                      >
                        X
                      </button>
                    </div>
                  </div>
                );
              })}
            <p>
              <button
                type="button"
                className="secondary"
                onClick={() => push({ name: '', email: '' })}
              >
                Add Friend
              </button>
              <ButtonSetFieldError name={`friends.0.name`} />
            </p>
          </div>
        )}
      </FieldArray>
    </div>
  );
};

export const ButtonSetFieldError = ({ name }: { name: string }) => {
  const formik = useFormikContext();

  return (
    <button
      type="button"
      onClick={() => {
        formik.setFieldError(name, `error ${Date.now()}`);
      }}
    >
      Set error {name}
    </button>
  );
};
