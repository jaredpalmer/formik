import { validateFormData, yupToFormErrors } from '../src/formik';

const Yup = require('yup');
const schema = Yup.object().shape({
  name: Yup.string('Name must be a string').required('required'),
});

describe('helpers', () => {
  describe('yupToFormErrors()', () => {
    it('should transform Yup ValidationErrors into an object', async () => {
      try {
        await schema.validate({}, { abortEarly: false });
      } catch (e) {
        expect(yupToFormErrors(e)).toEqual({
          name: 'required',
        });
      }
    });
  });

  describe('validateFormData()', () => {
    it('should validate', async () => {
      try {
        await validateFormData({}, schema);
      } catch (e) {
        expect(e.name).toEqual('ValidationError');
        expect(e.errors).toEqual(['required']);
      }
    });

    it('should stringify all values', async () => {
      try {
        const result = await validateFormData({ name: 1 }, schema);
        expect(result).not.toEqual({ name: 1 });
        expect(result).toEqual({ name: '1' });
      } catch (e) {
        throw e;
      }
    });
  });
});
