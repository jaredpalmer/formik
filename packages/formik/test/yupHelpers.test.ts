import { validateYupSchema, yupToFormErrors } from '../src';

const Yup = require('yup');
const schema = Yup.object().shape({
  name: Yup.string('Name must be a string').required('required'),
  field: Yup.string('Field must be a string'),
});
const nestedSchema = Yup.object().shape({
  object: Yup.object().shape({
    nestedField: Yup.string('Field must be a string'),
    nestedArray: Yup.array().of(
      Yup.string('Field must be a string').nullable()
    ),
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

    it('should stringify all values', async () => {
      try {
        const result = await validateYupSchema({ name: 1 }, schema);
        expect(result).not.toEqual({ name: 1 });
        expect(result).toEqual({ name: '1' });
      } catch (e) {
        throw e;
      }
    });

    it('should set undefined empty strings', async () => {
      try {
        const result = await validateYupSchema(
          { name: 'foo', field: '' },
          schema
        );
        expect(result.field).toBeUndefined();
      } catch (e) {
        throw e;
      }
    });

    it('should set undefined nested empty strings', async () => {
      try {
        const result = await validateYupSchema(
          { name: 'foo', object: { nestedField: '' } },
          nestedSchema
        );
        expect(result.object!.nestedField).toBeUndefined();
      } catch (e) {
        throw e;
      }
    });

    it('should set undefined nested empty strings', async () => {
      try {
        const result = await validateYupSchema(
          {
            name: 'foo',
            object: { nestedField: 'swag', nestedArray: ['', 'foo', 'bar'] },
          },
          nestedSchema
        );
        expect(result.object!.nestedArray!).toEqual([undefined, 'foo', 'bar']);
      } catch (e) {
        throw e;
      }
    });
  });
});
