import * as React from 'react';
import { connect } from './connect';

export const Form = connect<any>(({ formik: { handleSubmit }, ...props }) => (
  <form onSubmit={handleSubmit} {...props} />
));

Form.displayName = 'Form';
