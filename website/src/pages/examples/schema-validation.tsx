import * as React from 'react';
import { Example } from 'components/Example';

const SchemaValidation = require('../../examples/SchemaValidation.js');
const SchemaValidationCode = require('!raw-loader!../../examples/SchemaValidation.js');

const SchemaValidationExample: React.SFC<any> = props => {
  return (
    <Example
      js={SchemaValidationCode}
      component={SchemaValidation}
      color="teal"
      title="Schema Validation Example"
      description="An example Formik form with Yup object schema validation"
    />
  );
};

export default SchemaValidationExample;
