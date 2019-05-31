import { validateYupSchema, yupToFormErrors } from '../src';

const Yup = require('yup');
const schema = Yup.object().shape({
  name: Yup.string('Name must be a string').required('required'),
  num: Yup.number()
    .min(1, 'must be greater than or equal to 1')
    .integer('must be an integer'),
});

describe('Yup helpers', () => {
  describe('yupToFormErrors()', () => {
    it('should transform Yup ValidationErrors into an object', async () => {
      try {
        await schema.validate({}, { abortEarly: false });
      } catch (e) {
        expect(yupToFormErrors(e, { showMultipleFieldErrors: false })).toEqual({
          name: 'required',
        });
      }
    });

    it('should return an array for each field when showMultipleFieldErrors is enabled', async () => {
      try {
        await schema.validate({ name: '', num: 0.1 }, { abortEarly: false });
      } catch (e) {
        expect(yupToFormErrors(e, { showMultipleFieldErrors: true })).toEqual({
          name: ['required'],
          num: ['must be greater than or equal to 1', 'must be an integer'],
        });
      }
    });
  });

  describe('validateYupSchema()', () => {
    it('should validate', async () => {
      try {
        await validateYupSchema({}, schema);
      } catch (e) {
        expect(e.name).toEqual('ValidationError');
        expect(e.errors).toEqual(['required']);
      }
    });

    it('should stringify all values', async () => {
      try {
        const result = await validateYupSchema({ name: 1 }, schema);
        expect(result).not.toEqual({ name: 1 });
        expect(result).toEqual({ name: '1' });
      } catch (e) {
        throw e;
      }
    });
  });
});
