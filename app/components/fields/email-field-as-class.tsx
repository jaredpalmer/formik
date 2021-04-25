import { FieldAsComponentClass } from 'formik';
import React from 'react';

export class EmailFieldAsClass extends FieldAsComponentClass<
  string,
  {
    hidden: boolean;
    id: string;
  }
> {
  render() {
    return (
      <div className="email-field">
        <label htmlFor={this.props.id}>
          Email
          <input
            id={this.props.id}
            type={this.props.hidden ? 'hidden' : this.props.type}
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
