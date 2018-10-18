import * as React from 'react';
import { Form } from '../src';

import { mount } from 'enzyme';
import { noop } from './testHelpers';

describe('A <Form />', () => {
  describe('<Form >', () => {
    it('contains a form', () => {
      const onSubmit = jest.fn(noop);
      const wrapper = mount(
        <Form formik={{ onSubmit }} otherProp="example-prop">
          <div>Hey</div>
          <button id="submit" type="submit" />
        </Form>
      );
      expect(wrapper.find('form').length).toEqual(1);
      console.log(wrapper.find('#submit'));
      wrapper.find('#submit').simulate('click');
      expect(onSubmit).toBeCalled();
      expect(wrapper.props().contains('example-prop'));
    });
  });
});
