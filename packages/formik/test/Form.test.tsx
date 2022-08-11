import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { Form, Formik } from '../src';
import * as React from 'react';

describe('<Form />', () => {
  it('should submit form 5 times while holding enter key pressed', async () => {
    const onSubmit = jest.fn();
    render(
      <Formik initialValues={{}} onSubmit={onSubmit}>
        <Form name="Form" />
      </Formik>
    );
    const form = screen.getByRole('form');

    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
      fireEvent.submit(form);
      fireEvent.submit(form);
      fireEvent.submit(form);
    });

    await waitFor(() => expect(onSubmit).toBeCalledTimes(5));
  });

  it('should submit form two times when pressing enter key, then unpressing it & repeat', async () => {
    const onSubmit = jest.fn();
    render(
      <Formik initialValues={{}} preventStickingSubmissions onSubmit={onSubmit}>
        <Form name="Form" />
      </Formik>
    );
    const form = screen.getByRole('form');

    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
      fireEvent.submit(form);
      fireEvent.keyUp(form, { keyCode: 13 });
      fireEvent.submit(form);
      fireEvent.submit(form);
      fireEvent.keyUp(form, { keyCode: 13 });
    });

    await waitFor(() => expect(onSubmit).toBeCalledTimes(2));
  });

  it('should submit form only once while holding enter key pressed', async () => {
    const onSubmit = jest.fn();
    render(
      <Formik initialValues={{}} preventStickingSubmissions onSubmit={onSubmit}>
        <Form name="Form" />
      </Formik>
    );
    const form = screen.getByRole('form');

    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
      fireEvent.submit(form);
      fireEvent.submit(form);
      fireEvent.submit(form);
      fireEvent.keyUp(form, { keyCode: 13 });
    });

    await waitFor(() => expect(onSubmit).toBeCalledTimes(1));
  });
});
