import {
  isEmptyArray,
  setIn,
  isFirstIn,
  getIn,
  setNestedObjectValues,
  isPromise,
  getActiveElement,
  isNaN,
} from '../src/utils';

describe('utils', () => {
  describe('isEmptyArray', () => {
    it('returns true when an empty array is passed in', () => {
      expect(isEmptyArray([])).toBe(true);
    });
    it('returns false when anything other than empty array is passed in', () => {
      expect(isEmptyArray()).toBe(false);
      expect(isEmptyArray(null)).toBe(false);
      expect(isEmptyArray(123)).toBe(false);
      expect(isEmptyArray('abc')).toBe(false);
      expect(isEmptyArray({})).toBe(false);
      expect(isEmptyArray({ a: 1 })).toBe(false);
      expect(isEmptyArray(['abc'])).toBe(false);
    });
  });
  describe('setNestedObjectValues', () => {
    it('sets value flat object', () => {
      const obj = { x: 'y' };
      expect(setNestedObjectValues(obj, true)).toEqual({ x: true });
    });

    it('sets value of nested object', () => {
      const obj = {
        x: {
          nestedObject: {
            z: 'thing',
          },
        },
      };

      const newObj = {
        x: {
          nestedObject: {
            z: true,
          },
        },
      };

      expect(setNestedObjectValues(obj, true)).toEqual(newObj);
    });

    it('sets value of nested flat array items', () => {
      const obj = {
        x: {
          nestedObject: {
            z: 'thing',
          },
          nestedFlatArray: ['jared', 'ian'],
        },
      };

      const newObj = {
        x: {
          nestedObject: {
            z: true,
          },
          nestedFlatArray: [true, true],
        },
      };
      expect(setNestedObjectValues(obj, true)).toEqual(newObj);
    });

    it('sets value of nested complex array items', () => {
      const obj = {
        x: {
          nestedObject: {
            z: 'thing',
          },
          nestedFlatArray: [
            {
              nestedObject: {
                z: 'thing',
              },
            },
            {
              nestedObject: {
                z: 'thing',
              },
            },
          ],
        },
      };

      const newObj = {
        x: {
          nestedObject: {
            z: true,
          },
          nestedFlatArray: [
            {
              nestedObject: {
                z: true,
              },
            },
            {
              nestedObject: {
                z: true,
              },
            },
          ],
        },
      };
      expect(setNestedObjectValues(obj, true)).toEqual(newObj);
    });
    it('sets value of nested mixed array items', () => {
      const obj = {
        x: {
          nestedObject: {
            z: 'thing',
          },
          nestedFlatArray: [
            {
              nestedObject: {
                z: 'thing',
              },
            },
            'jared',
          ],
        },
      };

      const newObj = {
        x: {
          nestedObject: {
            z: true,
          },
          nestedFlatArray: [
            {
              nestedObject: {
                z: true,
              },
            },
            true,
          ],
        },
      };
      expect(setNestedObjectValues(obj, true)).toEqual(newObj);
    });
  });

  describe('getIn', () => {
    const obj = {
      a: {
        b: 2,
      },
    };

    it('gets a value by array path', () => {
      expect(getIn(obj, ['a', 'b'])).toBe(2);
    });

    it('gets a value by string path', () => {
      expect(getIn(obj, 'a.b')).toBe(2);
    });

    it('return "undefined" if value was not found using given path', () => {
      expect(getIn(obj, 'a.z')).toBeUndefined();
    });
  });

  describe('isFirstIn', () => {
    it('should work on flat error objects ', () => {
      const errors = { firstName: 'Error', lastName: 'Error' };

      expect(isFirstIn(errors, 'firstName')).toEqual(true);
      expect(isFirstIn(errors, 'lastName')).toEqual(false);
    });

    it('should work on nested error objects', () => {
      const errors = { address: { postalCode: 'Error', houseNumber: 'Error' } };

      expect(isFirstIn(errors, 'address')).toEqual(true);
      expect(isFirstIn(errors, 'address.postalCode')).toEqual(true);
      expect(isFirstIn(errors, 'address.houseNumber')).toEqual(false);
    });

    it('should work on arrays', () => {
      const errors = { foo: [{ bar: 'Error', baz: 'Error' }] };

      expect(isFirstIn(errors, 'foo[0].bar')).toEqual(true);
      expect(isFirstIn(errors, 'foo.0.bar')).toEqual(true);
      expect(isFirstIn(errors, 'foo[0].baz')).toEqual(false);
      expect(isFirstIn(errors, 'foo.0.baz')).toEqual(false);
    });

    it('should work on arrays where the first indexes are valid', () => {
      let errors = {
        foo: {
          5: { bar: 'Error', foo: 'Error' },
          6: { bar: 'Error', foo: 'Error' },
        },
      };

      expect(isFirstIn(errors, 'foo[5].bar')).toEqual(true);
      expect(isFirstIn(errors, 'foo[5].foo')).toEqual(false);
      expect(isFirstIn(errors, 'foo[6].bar')).toEqual(false);
    });
  });

  describe('setIn', () => {
    it('sets flat value', () => {
      const obj = { x: 'y' };
      const newObj = setIn(obj, 'flat', 'value');
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({ x: 'y', flat: 'value' });
    });

    it('keep the same object if nothing is changed', () => {
      const obj = { x: 'y' };
      const newObj = setIn(obj, 'x', 'y');
      expect(obj).toBe(newObj);
    });

    it('removes flat value', () => {
      const obj = { x: 'y' };
      const newObj = setIn(obj, 'x', undefined);
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({});
      expect(newObj).not.toHaveProperty('x');
    });

    it('sets nested value', () => {
      const obj = { x: 'y' };
      const newObj = setIn(obj, 'nested.value', 'nested value');
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({ x: 'y', nested: { value: 'nested value' } });
    });

    it('updates nested value', () => {
      const obj = { x: 'y', nested: { value: 'a' } };
      const newObj = setIn(obj, 'nested.value', 'b');
      expect(obj).toEqual({ x: 'y', nested: { value: 'a' } });
      expect(newObj).toEqual({ x: 'y', nested: { value: 'b' } });
    });

    it('removes nested value', () => {
      const obj = { x: 'y', nested: { value: 'a' } };
      const newObj = setIn(obj, 'nested.value', undefined);
      expect(obj).toEqual({ x: 'y', nested: { value: 'a' } });
      expect(newObj).toEqual({ x: 'y', nested: {} });
      expect(newObj.nested).not.toHaveProperty('value');
    });

    it('updates deep nested value', () => {
      const obj = { x: 'y', twofoldly: { nested: { value: 'a' } } };
      const newObj = setIn(obj, 'twofoldly.nested.value', 'b');
      expect(obj.twofoldly.nested === newObj.twofoldly.nested).toEqual(false); // fails, same object still
      expect(obj).toEqual({ x: 'y', twofoldly: { nested: { value: 'a' } } }); // fails, it's b here, too
      expect(newObj).toEqual({ x: 'y', twofoldly: { nested: { value: 'b' } } }); // works ofc
    });

    it('removes deep nested value', () => {
      const obj = { x: 'y', twofoldly: { nested: { value: 'a' } } };
      const newObj = setIn(obj, 'twofoldly.nested.value', undefined);
      expect(obj.twofoldly.nested === newObj.twofoldly.nested).toEqual(false);
      expect(obj).toEqual({ x: 'y', twofoldly: { nested: { value: 'a' } } });
      expect(newObj).toEqual({ x: 'y', twofoldly: { nested: {} } });
      expect(newObj.twofoldly.nested).not.toHaveProperty('value');
    });

    it('shallow clone data along the update path', () => {
      const obj = {
        x: 'y',
        twofoldly: { nested: ['a', { c: 'd' }] },
        other: { nestedOther: 'o' },
      };
      const newObj = setIn(obj, 'twofoldly.nested.0', 'b');
      // All new objects/arrays created along the update path.
      expect(obj).not.toBe(newObj);
      expect(obj.twofoldly).not.toBe(newObj.twofoldly);
      expect(obj.twofoldly.nested).not.toBe(newObj.twofoldly.nested);
      // All other objects/arrays copied, not cloned (retain same memory
      // location).
      expect(obj.other).toBe(newObj.other);
      expect(obj.twofoldly.nested[1]).toBe(newObj.twofoldly.nested[1]);
    });

    it('sets new array', () => {
      const obj = { x: 'y' };
      const newObj = setIn(obj, 'nested.0', 'value');
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({ x: 'y', nested: ['value'] });
    });

    it('updates nested array value', () => {
      const obj = { x: 'y', nested: ['a'] };
      const newObj = setIn(obj, 'nested[0]', 'b');
      expect(obj).toEqual({ x: 'y', nested: ['a'] });
      expect(newObj).toEqual({ x: 'y', nested: ['b'] });
    });

    it('adds new item to nested array', () => {
      const obj = { x: 'y', nested: ['a'] };
      const newObj = setIn(obj, 'nested.1', 'b');
      expect(obj).toEqual({ x: 'y', nested: ['a'] });
      expect(newObj).toEqual({ x: 'y', nested: ['a', 'b'] });
    });

    it('sticks to object with int key when defined', () => {
      const obj = { x: 'y', nested: { 0: 'a' } };
      const newObj = setIn(obj, 'nested.0', 'b');
      expect(obj).toEqual({ x: 'y', nested: { 0: 'a' } });
      expect(newObj).toEqual({ x: 'y', nested: { 0: 'b' } });
    });

    it('supports bracket path', () => {
      const obj = { x: 'y' };
      const newObj = setIn(obj, 'nested[0]', 'value');
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({ x: 'y', nested: ['value'] });
    });

    it('supports path containing key of the object', () => {
      const obj = { x: 'y' };
      const newObj = setIn(obj, 'a.x.c', 'value');
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({ x: 'y', a: { x: { c: 'value' } } });
    });

    it('should keep class inheritance for the top level object', () => {
      class TestClass {
        constructor(public key: string, public setObj?: any) {}
      }
      const obj = new TestClass('value');
      const newObj = setIn(obj, 'setObj.nested', 'setInValue');
      expect(obj).toEqual(new TestClass('value'));
      expect(newObj).toEqual({
        key: 'value',
        setObj: { nested: 'setInValue' },
      });
      expect(obj instanceof TestClass).toEqual(true);
      expect(newObj instanceof TestClass).toEqual(true);
    });

    it('can convert primitives to objects before setting', () => {
      const obj = { x: [{ y: true }] };
      const newObj = setIn(obj, 'x.0.y.z', true);
      expect(obj).toEqual({ x: [{ y: true }] });
      expect(newObj).toEqual({ x: [{ y: { z: true } }] });
    });
  });

  describe('isPromise', () => {
    it('verifies that a value is a promise', () => {
      const alwaysResolve = (resolve: Function) => resolve();
      const promise = new Promise(alwaysResolve);
      expect(isPromise(promise)).toEqual(true);
    });

    it('verifies that a value is not a promise', () => {
      const emptyObject = {};
      const identity = (i: any) => i;
      const foo = 'foo';
      const answerToLife = 42;

      expect(isPromise(emptyObject)).toEqual(false);
      expect(isPromise(identity)).toEqual(false);
      expect(isPromise(foo)).toEqual(false);
      expect(isPromise(answerToLife)).toEqual(false);

      expect(isPromise(undefined)).toEqual(false);
      expect(isPromise(null)).toEqual(false);
    });
  });

  describe('getActiveElement', () => {
    it('test getActiveElement with undefined', () => {
      const result = getActiveElement(undefined);
      expect(result).toEqual(document.body);
    });

    it('test getActiveElement with valid document', () => {
      const result = getActiveElement(document);
      expect(result).toEqual(document.body);
    });
  });

  describe('isNaN', () => {
    it('correctly validate NaN', () => {
      expect(isNaN(NaN)).toBe(true);
    });

    it('correctly validate not NaN', () => {
      expect(isNaN(undefined)).toBe(false);
      expect(isNaN(1)).toBe(false);
      expect(isNaN('')).toBe(false);
      expect(isNaN([])).toBe(false);
    });
  });
});
