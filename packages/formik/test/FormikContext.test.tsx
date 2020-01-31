import * as React from 'react';
import { render } from 'react-testing-library';
import { Formik } from '../src/Formik';
import { useFormikContext } from '../src/FormikContext';

describe('FormikContext', () => {
  describe('useFormikContext', () => {
    it('should return validationContext if set', () => {
      const validationSchema = 'validationSchema';

      const AComponenent: React.FC = () => {
        const formikContext = useFormikContext();
        expect(formikContext.validationSchema).toBe(validationSchema);
        return null;
      };

      render(
        <Formik
          initialValues={{ test: '' }}
          validationSchema={validationSchema}
          onSubmit={() => {}}
        >
          <AComponenent />
        </Formik>
      );
    });
  });
});
