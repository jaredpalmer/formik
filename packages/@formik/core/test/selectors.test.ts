import { testProps } from './constants';
import { selectIsFormValid } from './../src';

const initialValueIsValidFn = selectIsFormValid({
  ...testProps,
  isInitialValid: () => true,
});
const initialValueIsNotValidFn = selectIsFormValid({
  ...testProps,
  isInitialValid: () => false,
});
const initialValueIsValidBool = selectIsFormValid({
  ...testProps,
  isInitialValid: true,
});
const initialValueIsNotValidBool = selectIsFormValid({
  ...testProps,
  isInitialValid: false,
});

describe('selectIsFormValid', () => {
  it('uses isInitialValid when not dirty', async () => {
      // initialValue: true (function)
      expect(initialValueIsValidFn({ email: "error" }, false)).toBe(true);
      expect(initialValueIsValidFn({}, false)).toBe(true);
      // initialValue: true (bool)
      expect(initialValueIsValidBool({ email: "error" }, false)).toBe(true);
      expect(initialValueIsValidBool({}, false)).toBe(true);

      // initialValid: false (function)
      expect(initialValueIsNotValidFn({ email: "error" }, false)).toBe(false);
      expect(initialValueIsNotValidFn({}, false)).toBe(false);
      // isInitialValid: false (bool)
      expect(initialValueIsNotValidBool({ email: "error" }, false)).toBe(false);
      expect(initialValueIsNotValidBool({}, false)).toBe(false);
  });

  it('uses errors object when dirty', async () => {
      // initialValue: true (function)
      expect(initialValueIsValidFn({ email: "error" }, true)).toBe(false);
      expect(initialValueIsValidFn({}, true)).toBe(true);
      // initialValue: true (bool)
      expect(initialValueIsValidBool({ email: "error" }, true)).toBe(false);
      expect(initialValueIsValidBool({}, true)).toBe(true);

      // initialValid: false (function)
      expect(initialValueIsNotValidFn({ email: "error" }, true)).toBe(false);
      expect(initialValueIsNotValidFn({}, true)).toBe(true);
      // isInitialValid: false (bool)
      expect(initialValueIsNotValidBool({ email: "error" }, true)).toBe(false);
      expect(initialValueIsNotValidBool({}, true)).toBe(true);
  });
});
