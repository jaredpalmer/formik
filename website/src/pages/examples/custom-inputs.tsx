import * as React from 'react';
import { Example } from 'components/Example';

const CustomInputs = require('../../examples/CustomInputs.js');
const CustomInputsCode = require('!raw-loader!../../examples/CustomInputs.js');

const CustomInputsExample: React.SFC<any> = props => {
  return (
    <Example
      js={CustomInputsCode}
      component={CustomInputs}
      color="fuschia"
      title="Custom Input Example"
      description="An example Formik form with custom input components"
    />
  );
};

export default CustomInputsExample;
