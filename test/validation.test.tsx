import { createValidator } from '../src/validation';

describe('validation', () => {
  describe('createValidator', () => {
    it('should create function validator', () => {
      const validate = jest.fn();

      const validator = createValidator(validate);
      const values = {};
      validator(values);
      expect(validate).toHaveBeenCalledWith(values);
    });

    it('should create yup validator', () => {
      const schema = {
        validate: jest.fn(() => Promise.resolve()),
      };

      const validator = createValidator(undefined, schema);
      const values = {};
      validator(values);
      expect(schema.validate).toHaveBeenCalledWith(values, expect.any(Object));
    });

    it('should create dumb validator', () => {
      const validator = createValidator();

      const success = jest.fn();
      const error = jest.fn();
      validator({ a: 1 }).then(success, error);
      expect(success).toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });
  });
});
