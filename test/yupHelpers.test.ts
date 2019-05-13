import { validateYupSchema, yupToFormErrors } from '../src';

const Yup = require('yup');
const schema = Yup.object().shape({
  name: Yup.string('Name must be a string').required('required'),
});
const schemaWithContext = Yup.object().shape({
  name: Yup.string('Name must be a string').test({
    name: 'passed-context',
    exclusive: true,
    message: 'validationContext must be { test: "present" }',
    test: function() {
      return this.options.context.test === 'present';
    },
  }),
});

describe('Yup helpers', () => {
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

  describe('validateYupSchema()', () => {
    it('should validate', async () => {
      try {
        await validateYupSchema({}, schema);
      } catch (e) {
        expect(e.name).toEqual('ValidationError');
        expect(e.errors).toEqual(['required']);
      }
    });

    it('should validate with context', async () => {
      try {
        const result = await validateYupSchema(
          { name: 'jared' },
          schemaWithContext,
          false,
          { test: 'present' }
        );
        expect(result).toEqual({ name: 'jared' });
      } catch (e) {
        throw e;
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
