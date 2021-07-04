import { box } from '../box';
import { createDependencyStore } from '../dependencyStore';
import { createFactory } from '../factory';
import { SelectorCreator, bootstrapSelector } from '../selector';
import { StateCreator, bootstrapState } from '../state';
import { createTransactor } from '../transactor';

describe('createFactory()', () => {
  let createSelector: SelectorCreator;
  let createState: StateCreator;

  beforeEach(() => {
    const dependencyStore = createDependencyStore();
    const transactor = createTransactor();

    createSelector = bootstrapSelector({
      dependencyStore,
      transactor,
    });
    createState = bootstrapState({
      dependencyStore,
      createSelector,
    });
  });

  describe('when fetching', () => {
    test('should create items each unique key', () => {
      const factory = createFactory((key: number) => `item${key}`);
      expect(factory(1)).toBe('item1');
      expect(factory(2)).toBe('item2');
      expect(factory(3)).toBe('item3');
    });

    test('should return previously created items for each subsequent key', () => {
      const factory = createFactory((key: number) => box(key));
      expect(factory(1)).toEqual(box(1));
      expect(factory(1)).toBe(factory(1));
      expect(factory(2)).toEqual(box(2));
      expect(factory(2)).toBe(factory(2));
      expect(factory(3)).toEqual(box(3));
      expect(factory(3)).toBe(factory(3));
    });

    test('should map object keys by reference', () => {
      let counter = 0;
      const factory = createFactory(() => counter++);
      const key1 = box(1);
      expect(factory(key1)).toBe(factory(key1));
      expect(factory(key1)).not.toBe(factory(box(1)));
    });
  });

  describe('when bounding', () => {
    test('should create item when inside key range function', () => {
      const range = (key: number) => key > 0;
      const factory = createFactory((key: number) => `item${key}`, { range });
      expect(() => factory(1)).not.toThrowError();
      expect(() => factory(2)).not.toThrowError();
      expect(() => factory(3)).not.toThrowError();
    });

    test('should throw error when creating item outside key range function', () => {
      const range = (key: number) => key > 0;
      const factory = createFactory((key: number) => `item${key}`, { range });
      expect(() => factory(0)).toThrowError();
      expect(() => factory(-1)).toThrowError();
      expect(() => factory(-2)).toThrowError();
    });

    test('should create item when inside key range iterable', () => {
      const range = new Set([1, 2, 3]);
      const factory = createFactory((key: number) => `item${key}`, { range });
      expect(() => factory(1)).not.toThrowError();
      expect(() => factory(2)).not.toThrowError();
      expect(() => factory(3)).not.toThrowError();
    });

    test('should throw error when creating item outside key range iterable', () => {
      const range = new Set([1, 2, 3]);
      const factory = createFactory((key: number) => `item${key}`, { range });
      expect(() => factory(0)).toThrowError();
      expect(() => factory(-1)).toThrowError();
      expect(() => factory(4)).toThrowError();
    });

    test('should create item when inside key range selector', () => {
      const range = createState(new Set([1, 2, 3]));
      const factory = createFactory((key: number) => `item${key}`, { range });
      expect(() => factory(1)).not.toThrowError();
      expect(() => factory(2)).not.toThrowError();
      expect(() => factory(3)).not.toThrowError();
    });

    test('should throw error when creating item outside key range selector', () => {
      const range = createState(new Set([1, 2, 3]));
      const factory = createFactory((key: number) => `item${key}`, { range });
      expect(() => factory(0)).toThrowError();
      expect(() => factory(-1)).toThrowError();
      expect(() => factory(4)).toThrowError();
    });
  });
});
