import bucket from '../bucket';
import createFactory from '../createFactory';
import createState from '../createState';
import {mockFn} from './testUtils';

describe('createFactory()', () => {
  describe('when fetching', () => {
    test('should create items each unique key', () => {
      const factory = createFactory((key: number) => `item${key}`);
      expect(factory(1)).toBe('item1');
      expect(factory(2)).toBe('item2');
      expect(factory(3)).toBe('item3');
    });

    test('should return previously created items for each subsequent key', () => {
      const factory = createFactory((key: number) => bucket(key));
      expect(factory(1)).toEqual(bucket(1));
      expect(factory(1)).toBe(factory(1));
      expect(factory(2)).toEqual(bucket(2));
      expect(factory(2)).toBe(factory(2));
      expect(factory(3)).toEqual(bucket(3));
      expect(factory(3)).toBe(factory(3));
    });

    test('should map object keys by reference', () => {
      let counter = 0;
      const factory = createFactory(() => counter++);
      const key1 = bucket(1);
      expect(factory(key1)).toBe(factory(key1));
      expect(factory(key1)).not.toBe(factory(bucket(1)));
    });
  });

  describe('when observing', () => {
    test('should update keys whenever item is created', () => {
      const factory = createFactory((key: number) => `item${key}`);
      const observer = mockFn();
      factory.keys.observe(observer);
      factory(1);
      factory(1);
      factory(2);
      factory(2);
      expect(observer).toBeCalledTimes(2);
      expect(factory.keys.get()).toEqual(new Set([1, 2]));
    });

    test('should update values whenever item is created', () => {
      const factory = createFactory((key: number) => `item${key}`);
      const observer = mockFn();
      factory.observe(observer);
      factory(1);
      factory(1);
      factory(2);
      factory(2);
      expect(observer).toBeCalledTimes(2);
      expect(factory.get()).toEqual(
        new Map([
          [1, 'item1'],
          [2, 'item2'],
        ])
      );
    });

    test('should return new item after updating values', () => {
      const factory = createFactory((key: number) => `item${key}`);
      factory(1);
      factory(2);
      factory.set(new Map([[1, 'new1']]));
      expect(factory(1)).toBe('new1');
      expect(factory(2)).toBe('item2');
    });

    test('should return item after adding values', () => {
      const factory = createFactory((key: number) => `item${key}`);
      factory.set(new Map([[1, 'new1']]));
      expect(factory(1)).toBe('new1');
      expect(factory(2)).toBe('item2');
    });

    test('should create item after removing values', () => {
      const factory = createFactory((key: number) => bucket(key));
      const item1 = factory(1);
      const item2 = factory(2);
      factory.set(values => {
        values.delete(2);
        return values;
      });
      expect(factory(1)).toBe(item1);
      expect(factory(2)).not.toBe(item2);
    });

    test('should update keys whenever value is added', () => {
      const factory = createFactory((key: number) => `item${key}`);
      const observer = mockFn();
      factory.keys.observe(observer);
      factory.set(
        new Map([
          [1, 'new1'],
          [2, 'new2'],
        ])
      );
      expect(observer).toBeCalledTimes(1);
      expect(factory.keys.get()).toEqual(new Set([1, 2]));
    });

    test('should update keys whenever value is deleted', () => {
      const factory = createFactory((key: number) => `item${key}`);
      const observer = mockFn();
      factory(1);
      factory(2);
      factory.keys.observe(observer);
      factory.set(new Map([[1, 'new1']]));
      expect(observer).toBeCalledTimes(1);
      expect(factory.keys.get()).toEqual(new Set([1]));
    });

    test('should not update keys whenever value is updated', () => {
      const factory = createFactory((key: number) => `item${key}`);
      const observer = mockFn();
      factory(1);
      factory(2);
      factory.keys.observe(observer);
      factory.set(
        new Map([
          [1, 'new1'],
          [2, 'new2'],
        ])
      );
      expect(observer).not.toBeCalled();
      expect(factory.keys.get()).toEqual(new Set([1, 2]));
    });
  });

  describe('when bounding', () => {
    test('should create item when inside key range function', () => {
      const range = (key: number) => key > 0;
      const factory = createFactory((key: number) => `item${key}`, range);
      expect(() => factory(1)).not.toThrowError();
      expect(() => factory(2)).not.toThrowError();
      expect(() => factory(3)).not.toThrowError();
    });

    test('should throw error when creating item outside key range function', () => {
      const range = (key: number) => key > 0;
      const factory = createFactory((key: number) => `item${key}`, range);
      expect(() => factory(0)).toThrowError();
      expect(() => factory(-1)).toThrowError();
      expect(() => factory(-2)).toThrowError();
    });

    test('should create item when inside key range iterable', () => {
      const range = [1, 2, 3];
      const factory = createFactory((key: number) => `item${key}`, range);
      expect(() => factory(1)).not.toThrowError();
      expect(() => factory(2)).not.toThrowError();
      expect(() => factory(3)).not.toThrowError();
    });

    test('should throw error when creating item outside key range iterable', () => {
      const range = [1, 2, 3];
      const factory = createFactory((key: number) => `item${key}`, range);
      expect(() => factory(0)).toThrowError();
      expect(() => factory(-1)).toThrowError();
      expect(() => factory(4)).toThrowError();
    });

    test('should create item when inside key range selector', () => {
      const range = createState([1, 2, 3]);
      const factory = createFactory((key: number) => `item${key}`, range);
      expect(() => factory(1)).not.toThrowError();
      expect(() => factory(2)).not.toThrowError();
      expect(() => factory(3)).not.toThrowError();
    });

    test('should throw error when creating item outside key range selector', () => {
      const range = createState([1, 2, 3]);
      const factory = createFactory((key: number) => `item${key}`, range);
      expect(() => factory(0)).toThrowError();
      expect(() => factory(-1)).toThrowError();
      expect(() => factory(4)).toThrowError();
    });

    test('should update keys with key range selector after item creation', () => {
      const range = createState([1, 2, 3]);
      const factory = createFactory((key: number) => `item${key}`, range);
      factory(1);
      factory(2);
      factory(3);
      range.set([1, 2]);
      expect(factory.keys.get()).toEqual(new Set([1, 2]));
    });

    test('should update values with key range selector after item creation', () => {
      const range = createState([1, 2, 3]);
      const factory = createFactory((key: number) => `item${key}`, range);
      const item1 = factory(1);
      const item2 = factory(2);
      factory(3);
      range.set([1, 2]);
      const values = factory.get();
      expect(values.get(1)).toBe(item1);
      expect(values.get(2)).toBe(item2);
      expect(values.has(3)).toBeFalsy();
    });
  });
});
