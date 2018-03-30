import * as React from 'react';
import { Example } from 'components/Example';
const MultiStep = require('../../examples/MultiStep.js');
const MultiStepCode = require('!raw-loader!../../examples/MultiStep.js');

const MultiStepExample: React.SFC<any> = props => {
  return (
    <Example
      js={MultiStepCode}
      component={MultiStep}
      color="gray"
      title="Multi-step Example"
      description="An example Formik multi-step form / wizard"
    />
  );
};

export default MultiStepExample;
