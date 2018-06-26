import * as React from 'react';
import { Example } from 'components/Example';
import { Form } from 'formik';

const ExampleComponent = require('../../examples/AsyncValidationOuter.js');
const ExampleCode = require('!raw-loader!../../examples/AsyncValidationOuter.js');

const BasicExample: React.SFC<any> = props => {
  return (
    <Example
      js={ExampleCode}
      component={ExampleComponent}
      color="indigo"
      title="Async Validation with initialErrors"
      description="An example of a another approach to async validation"
    />
  );
};

export default BasicExample;
