import { setDeep, setNestedObjectValues } from '../src/utils';

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

  describe('setDeep', () => {
    it('sets flat value', () => {
      const obj = { x: 'y' };
      const newObj = setDeep('flat', 'value', obj);
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({ x: 'y', flat: 'value' });
    });

    it('sets nested value', () => {
      const obj = { x: 'y' };
      const newObj = setDeep('nested.value', 'nested value', obj);
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({ x: 'y', nested: { value: 'nested value' } });
    });

    it('updates nested value', () => {
      const obj = { x: 'y', nested: { value: 'a' } };
      const newObj = setDeep('nested.value', 'b', obj);
      expect(obj).toEqual({ x: 'y', nested: { value: 'a' } });
      expect(newObj).toEqual({ x: 'y', nested: { value: 'b' } });
    });

    it('updates deep nested value', () => {
      const obj = { x: 'y', twofoldly: { nested: { value: 'a' } } };
      const newObj = setDeep('twofoldly.nested.value', 'b', obj);
      expect(obj.twofoldly.nested === newObj.twofoldly.nested).toEqual(false); // fails, same object still
      expect(obj).toEqual({ x: 'y', twofoldly: { nested: { value: 'a' } } }); // fails, it's b here, too
      expect(newObj).toEqual({ x: 'y', twofoldly: { nested: { value: 'b' } } }); // works ofc
    });

    it('sets new array', () => {
      const obj = { x: 'y' };
      const newObj = setDeep('nested.0', 'value', obj);
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({ x: 'y', nested: ['value'] });
    });

    it('updates nested array value', () => {
      const obj = { x: 'y', nested: ['a'] };
      const newObj = setDeep('nested[0]', 'b', obj);
      expect(obj).toEqual({ x: 'y', nested: ['a'] });
      expect(newObj).toEqual({ x: 'y', nested: ['b'] });
    });

    it('adds new item to nested array', () => {
      const obj = { x: 'y', nested: ['a'] };
      const newObj = setDeep('nested.1', 'b', obj);
      expect(obj).toEqual({ x: 'y', nested: ['a'] });
      expect(newObj).toEqual({ x: 'y', nested: ['a', 'b'] });
    });

    it('sticks to object with int key when defined', () => {
      const obj = { x: 'y', nested: { 0: 'a' } };
      const newObj = setDeep('nested.0', 'b', obj);
      expect(obj).toEqual({ x: 'y', nested: { 0: 'a' } });
      expect(newObj).toEqual({ x: 'y', nested: { 0: 'b' } });
    });

    it('supports bracket path', () => {
      const obj = { x: 'y' };
      const newObj = setDeep('nested[0]', 'value', obj);
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({ x: 'y', nested: ['value'] });
    });
  });

  describe('setDeep', () => {
    it('sets flat value', () => {
      const obj = { x: 'y' };
      const newObj = setDeep('flat', 'value', obj);
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({ x: 'y', flat: 'value' });
    });

    it('sets nested value', () => {
      const obj = { x: 'y' };
      const newObj = setDeep('nested.value', 'nested value', obj);
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({ x: 'y', nested: { value: 'nested value' } });
    });

    it('updates nested value', () => {
      const obj = { x: 'y', nested: { value: 'a' } };
      const newObj = setDeep('nested.value', 'b', obj);
      expect(obj).toEqual({ x: 'y', nested: { value: 'a' } });
      expect(newObj).toEqual({ x: 'y', nested: { value: 'b' } });
    });

    it('updates deep nested value', () => {
      const obj = { x: 'y', twofoldly: { nested: { value: 'a' } } };
      const newObj = setDeep('twofoldly.nested.value', 'b', obj);
      expect(obj.twofoldly.nested === newObj.twofoldly.nested).toEqual(false); // fails, same object still
      expect(obj).toEqual({ x: 'y', twofoldly: { nested: { value: 'a' } } }); // fails, it's b here, too
      expect(newObj).toEqual({ x: 'y', twofoldly: { nested: { value: 'b' } } }); // works ofc
    });

    it('sets new array', () => {
      const obj = { x: 'y' };
      const newObj = setDeep('nested.0', 'value', obj);
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({ x: 'y', nested: ['value'] });
    });

    it('updates nested array value', () => {
      const obj = { x: 'y', nested: ['a'] };
      const newObj = setDeep('nested[0]', 'b', obj);
      expect(obj).toEqual({ x: 'y', nested: ['a'] });
      expect(newObj).toEqual({ x: 'y', nested: ['b'] });
    });

    it('adds new item to nested array', () => {
      const obj = { x: 'y', nested: ['a'] };
      const newObj = setDeep('nested.1', 'b', obj);
      expect(obj).toEqual({ x: 'y', nested: ['a'] });
      expect(newObj).toEqual({ x: 'y', nested: ['a', 'b'] });
    });

    it('sticks to object with int key when defined', () => {
      const obj = { x: 'y', nested: { 0: 'a' } };
      const newObj = setDeep('nested.0', 'b', obj);
      expect(obj).toEqual({ x: 'y', nested: { 0: 'a' } });
      expect(newObj).toEqual({ x: 'y', nested: { 0: 'b' } });
    });

    it('supports bracket path', () => {
      const obj = { x: 'y' };
      const newObj = setDeep('nested[0]', 'value', obj);
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({ x: 'y', nested: ['value'] });
    });
  });
});
