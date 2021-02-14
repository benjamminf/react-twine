import bucket from '../bucket';
import createStateFactory from '../createStateFactory';
import createState from '../createState';
import {mockFn} from './testUtils';
import {captureTasks} from '../tasks';

describe('createStateFactory()', () => {
  describe('when fetching', () => {
    test('should create state each unique key', () => {
      const factory = createStateFactory((key: number) => `item${key}`);
      expect(factory(1).get()).toBe('item1');
      expect(factory(2).get()).toBe('item2');
      expect(factory(3).get()).toBe('item3');
    });

    test('should return previously created state for each subsequent key', () => {
      const factory = createStateFactory((key: number) => bucket(key));
      expect(factory(1).get()).toEqual(bucket(1));
      expect(factory(1).get()).toBe(factory(1).get());
      expect(factory(2).get()).toEqual(bucket(2));
      expect(factory(2).get()).toBe(factory(2).get());
      expect(factory(3).get()).toEqual(bucket(3));
      expect(factory(3).get()).toBe(factory(3).get());
    });

    test('should map object keys by reference', () => {
      let counter = 0;
      const factory = createStateFactory(() => counter++);
      const key1 = bucket(1);
      expect(factory(key1).get()).toBe(factory(key1).get());
      expect(factory(key1).get()).not.toBe(factory(bucket(1)).get());
    });
  });

  describe('when observing', () => {
    test('should update keys whenever state is created', () => {
      const factory = createStateFactory((key: number) => `item${key}`);
      const observer = mockFn();
      factory.keys.observe(observer);
      factory(1);
      factory(1);
      factory(2);
      factory(2);
      expect(observer).toBeCalledTimes(2);
      expect(factory.keys.get()).toEqual(new Set([1, 2]));
    });

    test('should update state values whenever state is created', () => {
      const factory = createStateFactory((key: number) => `item${key}`);
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

    test('should update state values whenever state is updated', () => {
      const factory = createStateFactory((key: number) => `item${key}`);
      const observer = mockFn();
      factory.observe(observer);
      factory(1);
      factory(2).set('new2');
      expect(observer).toBeCalledTimes(3);
      expect(factory.get()).toEqual(
        new Map([
          [1, 'item1'],
          [2, 'new2'],
        ])
      );
    });

    test('should update state values efficiently whenever state is updated', () => {
      const factory = createStateFactory((key: number) => `item${key}`);
      const observer = mockFn();
      factory.observe(observer);
      captureTasks(() => {
        factory(1);
        factory(2).set('new2');
      });
      expect(observer).toBeCalledTimes(1);
      expect(factory.get()).toEqual(
        new Map([
          [1, 'item1'],
          [2, 'new2'],
        ])
      );
    });

    test('should return new state value after updating state values', () => {
      const factory = createStateFactory((key: number) => `item${key}`);
      factory(1);
      factory(2);
      factory.set(new Map([[1, 'new1']]));
      expect(factory(1).get()).toBe('new1');
      expect(factory(2).get()).toBe('item2');
    });

    test('should return state values after adding state values', () => {
      const factory = createStateFactory((key: number) => `item${key}`);
      factory.set(new Map([[1, 'new1']]));
      expect(factory(1).get()).toBe('new1');
      expect(factory(2).get()).toBe('item2');
    });

    test('should create state after removing state values', () => {
      const factory = createStateFactory((key: number) => bucket(key));
      const state1 = factory(1);
      const state2 = factory(2);
      factory.set(values => {
        values.delete(2);
        return values;
      });
      expect(factory(1)).toBe(state1);
      expect(factory(2)).not.toBe(state2);
    });

    test('should update keys whenever state value is added', () => {
      const factory = createStateFactory((key: number) => `item${key}`);
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

    test('should update keys whenever state value is deleted', () => {
      const factory = createStateFactory((key: number) => `item${key}`);
      const observer = mockFn();
      factory(1);
      factory(2);
      factory.keys.observe(observer);
      factory.set(new Map([[1, 'new1']]));
      expect(observer).toBeCalledTimes(1);
      expect(factory.keys.get()).toEqual(new Set([1]));
    });

    test('should not update keys whenever state value is updated', () => {
      const factory = createStateFactory((key: number) => `item${key}`);
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
    test('should create state when inside key range function', () => {
      const range = (key: number) => key > 0;
      const factory = createStateFactory((key: number) => `item${key}`, range);
      expect(() => factory(1)).not.toThrowError();
      expect(() => factory(2)).not.toThrowError();
      expect(() => factory(3)).not.toThrowError();
    });

    test('should throw error when creating state outside key range function', () => {
      const range = (key: number) => key > 0;
      const factory = createStateFactory((key: number) => `item${key}`, range);
      expect(() => factory(0)).toThrowError();
      expect(() => factory(-1)).toThrowError();
      expect(() => factory(-2)).toThrowError();
    });

    test('should create state when inside key range iterable', () => {
      const range = [1, 2, 3];
      const factory = createStateFactory((key: number) => `item${key}`, range);
      expect(() => factory(1)).not.toThrowError();
      expect(() => factory(2)).not.toThrowError();
      expect(() => factory(3)).not.toThrowError();
    });

    test('should throw error when creating state outside key range iterable', () => {
      const range = [1, 2, 3];
      const factory = createStateFactory((key: number) => `item${key}`, range);
      expect(() => factory(0)).toThrowError();
      expect(() => factory(-1)).toThrowError();
      expect(() => factory(4)).toThrowError();
    });

    test('should create state when inside key range selector', () => {
      const range = createState([1, 2, 3]);
      const factory = createStateFactory((key: number) => `item${key}`, range);
      expect(() => factory(1)).not.toThrowError();
      expect(() => factory(2)).not.toThrowError();
      expect(() => factory(3)).not.toThrowError();
    });

    test('should throw error when creating state outside key range selector', () => {
      const range = createState([1, 2, 3]);
      const factory = createStateFactory((key: number) => `item${key}`, range);
      expect(() => factory(0)).toThrowError();
      expect(() => factory(-1)).toThrowError();
      expect(() => factory(4)).toThrowError();
    });

    test('should update keys with key range selector after state creation', () => {
      const range = createState([1, 2, 3]);
      const factory = createStateFactory((key: number) => `item${key}`, range);
      factory(1);
      factory(2);
      factory(3);
      range.set([1, 2]);
      expect(factory.keys.get()).toEqual(new Set([1, 2]));
    });

    test('should update state values with key range selector after state creation', () => {
      const range = createState([1, 2, 3]);
      const factory = createStateFactory((key: number) => `item${key}`, range);
      const state1 = factory(1);
      const state2 = factory(2);
      factory(3);
      range.set([1, 2]);
      const values = factory.get();
      expect(values.get(1)).toBe(state1.get());
      expect(values.get(2)).toBe(state2.get());
      expect(values.has(3)).toBeFalsy();
    });
  });
});
