import * as React from 'react';
import {
  FieldConfig,
  Form,
  FormikProvider,
  useField,
  useFormik,
  useFormikContext,
} from 'formik';
import { selectRandomArrayItem, selectRange } from '../../helpers/array-helpers';
import { useCheckTearing } from '../../helpers/tearing-helpers';
import {
  DynamicValues,
  useChaosHelpers,
} from '../../helpers/chaos-helpers';

const selectFullState = <T,>(state: T) => state

const Input = (p: FieldConfig<string>) => {
  useField(p);
  const api = useFormikContext();
  const childState = api.useState(selectFullState);

  return (
    <div className="state" id={p.name}>
      <pre>
        <code>{JSON.stringify(childState, null, 2)}</code>
      </pre>
    </div>
  );
};

const isRequired = (v: string) => {
  return v && v.trim() !== '' ? undefined : 'Required';
};

const array = selectRange(50);
const initialValues = array.reduce<Record<string, string>>((prev, id) => {
  prev[`Input ${id}`] = '';
  return prev;
}, {});

const onSubmit = async (values: DynamicValues) => {
  await new Promise(r => setTimeout(r, 500));
  console.log(JSON.stringify(values, null, 2));
};

const [parentId, lastId, ...inputIDs] = array;

const kids = inputIDs.map(id => (
  <Input key={`input-${id}`} name={`input-${id}`} validate={isRequired} />
));

const TearingPage = () => {
  const formik = useFormik({ onSubmit, initialValues });
  const parentState = formik.useState(selectFullState);

  const chaosHelpers = useChaosHelpers(formik, array);

  const handleClickWithoutTransition = React.useCallback(() => {
    selectRandomArrayItem(chaosHelpers)();
  }, [chaosHelpers]);

  // skip form-level state to check inputs
  const didInputsTear = useCheckTearing(array.length - 1, 1);

  // check form-level against inputs
  const didFormStateTearWithInputs = useCheckTearing(array.length);

  return (
    <div className="tearing-page">
      <div>
        <style jsx global>
          {`
            .state-container {
              display: flex;
              max-height: 500px;
              overflow-x: hidden;
              align-items: flex-start;
            }
            .state {
              width: 20%;
            }
            .middle {
              position: relative;
              display: flex;
              width: 60%;
              overflow: auto;
            }
            .middle .state {
              min-width: 33.333%;
            }
          `}
        </style>
        <h1>Formik Tearing Tests</h1>
        <h3>
          Did inputs tear amongst themselves? {didInputsTear ? 'Yes' : 'No'}
        </h3>
        <h3>
          Did form-level state tear with inputs?{' '}
          {didFormStateTearWithInputs ? 'Yes' : 'No'}
        </h3>
        <button
          type="button"
          id="update-without-transition"
          onClick={handleClickWithoutTransition}
        >
          Update Formik with Random Dispatch
        </button>
      </div>
      <FormikProvider value={formik}>
        <Form>
          <div className="state-container">
            <div className="state" id={`input-${parentId.toString()}`}>
              <pre>
                <code>{JSON.stringify(parentState, null, 2)}</code>
              </pre>
            </div>
            <div className="middle">{kids}</div>
            <div className="state" id={`input-${lastId.toString()}`}>
              <pre>
                <code>{JSON.stringify(parentState, null, 2)}</code>
              </pre>
            </div>
          </div>
          <button type="submit">Submit</button>
        </Form>
      </FormikProvider>
    </div>
  );
}

export default TearingPage;
