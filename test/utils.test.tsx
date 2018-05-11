import { unsetIn, setIn, setNestedObjectValues, isPromise } from '../src/utils';

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

  describe('unsetIn', () => {
    it("does nothing when given a path that doesn't exist", () => {
      const obj = { a: '1', b: '2' };
      const newObj = unsetIn(obj, 'c');
      expect(obj).toEqual({ a: '1', b: '2' });
      expect(newObj).toEqual({ a: '1', b: '2' });
    });

    it("does nothing when given a nested path that doesn't exist", () => {
      const obj = { a: '1', b: { c: '2' } };
      const newObj = unsetIn(obj, 'b.d');
      expect(obj).toEqual({ a: '1', b: { c: '2' } });
      expect(newObj).toEqual({ a: '1', b: { c: '2' } });
    });

    it('unsets a flat value', () => {
      const obj = { a: '1', b: '2' };
      const newObj = unsetIn(obj, 'a');
      expect(obj).toEqual({ a: '1', b: '2' });
      expect(newObj).toEqual({ b: '2' });
    });

    it('unsets a flat value and leaves an empty object if one key at top', () => {
      const obj = { a: '1' };
      const newObj = unsetIn(obj, 'a');
      expect(obj).toEqual({ a: '1' });
      expect(newObj).toEqual({});
    });

    it('unsets a nested value and deletes empty objecct if nested', () => {
      const obj = { a: '1', b: { c: '2' } };
      const newObj = unsetIn(obj, 'b.c');
      expect(obj).toEqual({ a: '1', b: { c: '2' } });
      expect(newObj).toEqual({ a: '1' });
    });

    it('unsets and deletes multiple levels', () => {
      const obj = { a: '1', b: { c: { d: '2' } } };
      const newObj = unsetIn(obj, 'b.c.d');
      expect(obj).toEqual({ a: '1', b: { c: { d: '2' } } });
      expect(newObj).toEqual({ a: '1' });
    });

    it('can traverse arrays', () => {
      const obj = { a: '1', b: [{ c: '2', d: '3' }, { e: '4' }] };
      const newObj = unsetIn(obj, 'b.0.c');
      expect(obj).toEqual({
        a: '1',
        b: [{ c: '2', d: '3' }, { e: '4' }],
      });
      expect(newObj).toEqual({
        a: '1',
        b: [{ d: '3' }, { e: '4' }],
      });
    });

    it('replaces empty objects with deleted index in arrays', () => {
      const obj = { a: '1', b: [{ c: '2', d: '3' }, { e: '4' }] };
      const newObj = unsetIn(obj, 'b.1.e');
      expect(obj).toEqual({
        a: '1',
        b: [{ c: '2', d: '3' }, { e: '4' }],
      });
      expect(newObj).toEqual({ a: '1', b: [{ c: '2', d: '3' }, undefined] });
    });

    it('deletes fully empty arrays too', () => {
      const obj = { a: '1', b: [undefined, { e: '2' }] };
      const newObj = unsetIn(obj, 'b.1.e');
      expect(obj).toEqual({
        a: '1',
        b: [undefined, { e: '2' }],
      });
      expect(newObj).toEqual({ a: '1' });
    });
  });

  describe('setIn', () => {
    it('sets flat value', () => {
      const obj = { x: 'y' };
      const newObj = setIn(obj, 'flat', 'value');
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({ x: 'y', flat: 'value' });
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

    it('updates deep nested value', () => {
      const obj = { x: 'y', twofoldly: { nested: { value: 'a' } } };
      const newObj = setIn(obj, 'twofoldly.nested.value', 'b');
      expect(obj.twofoldly.nested === newObj.twofoldly.nested).toEqual(false); // fails, same object still
      expect(obj).toEqual({ x: 'y', twofoldly: { nested: { value: 'a' } } }); // fails, it's b here, too
      expect(newObj).toEqual({ x: 'y', twofoldly: { nested: { value: 'b' } } }); // works ofc
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
});
