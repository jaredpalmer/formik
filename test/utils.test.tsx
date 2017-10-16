import { setDeep } from '../src/utils';

describe('helpers', () => {
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

    it('sets new array', () => {
      const obj = { x: 'y' };
      const newObj = setDeep('nested.0', 'value', obj);
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({ x: 'y', nested: { 0: 'value' } });
    });

    it('updates nested array value', () => {
      const obj = { x: 'y', nested: ['a'] };
      const newObj = setDeep('nested.0', 'b', obj);
      expect(obj).toEqual({ x: 'y', nested: ['a'] });
      expect(newObj).toEqual({ x: 'y', nested: { 0: 'b' } });
    });

    it('adds new item to nested array', () => {
      const obj = { x: 'y', nested: ['a'] };
      const newObj = setDeep('nested.1', 'b', obj);
      expect(obj).toEqual({ x: 'y', nested: ['a'] });
      expect(newObj).toEqual({ x: 'y', nested: { 0: 'a', 1: 'b' } });
    });

    it('supports bracket path', () => {
      const obj = { x: 'y' };
      const newObj = setDeep('nested[0]', 'value', obj);
      expect(obj).toEqual({ x: 'y' });
      expect(newObj).toEqual({ x: 'y', nested: { 0: 'value' } });
    });
  });
});
