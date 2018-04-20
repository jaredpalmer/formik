import * as React from 'react';
import { Example } from 'components/Example';

const SyncValidation = require('../../examples/SyncValidation');
const SyncValidationCode = require('!raw-loader!../../examples/SyncValidation.js');

const SyncValidationExample: React.SFC<any> = props => {
  return (
    <Example
      js={SyncValidationCode}
      component={SyncValidation}
      color="blue"
      title="Sync Validation Example"
      description="An example Formik form with synchronous validation"
    />
  );
};

export default SyncValidationExample;
