import * as PropTypes from 'prop-types';
import * as React from 'react';

export const Form: React.SFC<any> = (props, context) =>
  <form onSubmit={context.formik.handleSubmit} {...props} />;

Form.contextTypes = {
  formik: PropTypes.object,
};
