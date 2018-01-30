import * as React from 'react';
import { Example } from 'components/Example';
const Arrays = require('../../examples/Arrays.js');
const ArraysCode = require('!raw-loader!../../examples/Arrays.js');

const ArraysExample: React.SFC<any> = props => {
  return (
    <Example
      js={ArraysCode}
      component={Arrays}
      color="orange"
      title="Arrays Example"
      description="An example Formik form with complex nested arrays"
    />
  );
};

export default ArraysExample;
