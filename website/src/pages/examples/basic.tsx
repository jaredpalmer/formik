import * as React from 'react';
import { Example } from 'components/Example';
import { Form } from 'formik';

const Basic = require('../../examples/Basic.js');
const BasicCode = require('!raw-loader!../../examples/Basic.js');

const BasicExample: React.SFC<any> = props => {
  return (
    <Example
      js={BasicCode}
      component={Basic}
      color="indigo"
      title="Basic Example"
      description="An example of a basic Formik form"
    />
  );
};

export default BasicExample;
