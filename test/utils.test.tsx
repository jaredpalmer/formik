import {
  setIn,
  setNestedObjectValues,
  isPromise,
  getActiveElement,
  makeCancelable,
  isNaN,
} from '../src/utils';

describe('utils', () => {
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

  describe('makeCancelable', () => {
    it('correctly call promise without cancel', async () => {
      const PromiseToResolve = () => {
        return Promise.resolve('test');
      };

      const [updatedPromise] = makeCancelable(PromiseToResolve());

      const result = await (() => {
        return updatedPromise;
      })();

      expect(result).toEqual('test');
    });

    it('correctly cancel successful promise', async () => {
      const PromiseToResolve = () => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve('test');
          }, 10);
        });
      };

      const [updatedPromise, cancel] = makeCancelable(PromiseToResolve());

      cancel();
      try {
        await (() => {
          return updatedPromise;
        })();
      } catch (e) {
        expect(e).toEqual({ isCanceled: true });
      }
    });

    it('correctly cancel rejected promise', async () => {
      const PromiseToResolve = () => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            reject('test');
          }, 100);
        });
      };

      const [updatedPromise, cancel] = makeCancelable(PromiseToResolve());

      cancel();
      try {
        await (() => {
          return updatedPromise;
        })();
      } catch (e) {
        expect(e).toEqual({ isCanceled: true });
      }
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
