import * as Yup from 'yup';
import { validateYupSchema, yupToFormErrors } from '../src';

const schema = Yup.object().shape({
  name: Yup.string().required('required'),
  field: Yup.string(),
});

const nestedSchema = Yup.object().shape({
  object: Yup.object().shape({
    nestedField: Yup.string(),
    nestedArray: Yup.array().of(Yup.string().nullable(true)),
  }),
});

const deepNestedSchema = Yup.object({
  object: Yup.object({
    nestedField: Yup.number().required(),
  }),
  object2: Yup.object({
    nestedFieldWithRef: Yup.number().min(0).max(Yup.ref('$object.nestedField')),
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
        const err = e as Yup.ValidationError;

        expect(err.name).toEqual('ValidationError');
        expect(err.errors).toEqual(['required']);
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

    it('should provide current values as context to enable deep object field validation', async () => {
      try {
        await validateYupSchema(
          { object: { nestedField: 23 }, object2: { nestedFieldWithRef: 24 } },
          deepNestedSchema
        );
      } catch (e) {
        expect((e as Yup.ValidationError).name).toEqual('ValidationError');
        expect((e as Yup.ValidationError).errors).toEqual([
          'object2.nestedFieldWithRef must be less than or equal to 23',
        ]);
      }
    });
  });
});
