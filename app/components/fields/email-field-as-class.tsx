import { FieldAsClass, FieldAsProps } from 'formik';
import React from 'react';

export class EmailFieldAsClass extends FieldAsClass<string> {
  render() {
    return (
      <div className="email-field">
        <label>
          Email
          <input
            type={this.props.type}
            name={this.props.name}
            value={this.props.value}
            onChange={this.props.onChange}
            onBlur={this.props.onBlur}
          />
        </label>
      </div>
    );
  }
}

export const TypedEmailField: React.ComponentClass<FieldAsProps<string, any>> =
  EmailFieldAsClass;
