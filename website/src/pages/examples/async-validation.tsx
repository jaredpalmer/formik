import * as React from 'react';
import { Example } from 'components/Example';
const AsyncValidation = require('../../examples/AsyncValidation.js');
const AsyncValidationCode = require('!raw-loader!../../examples/AsyncValidation.js');

const AsyncValidationExample: React.SFC<any> = props => {
  return (
    <Example
      js={AsyncValidationCode}
      component={AsyncValidation}
      color="orange"
      title="Async Validation Example"
      description="An example Formik form with async validation"
    />
  );
};

export default AsyncValidationExample;
