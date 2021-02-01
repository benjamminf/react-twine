import createMutableState from '../createMutableState';
import {mockFn} from './testUtils';

describe('createMutableState()', () => {
  describe('when initializing with defaults', () => {
    describe('by value', () => {
      test('should use empty value', () => {
        expect(createMutableState(null).get()).toBeNull();
        expect(createMutableState(undefined).get()).toBeUndefined();
      });

      test('should use primitive', () => {
        expect(createMutableState(42).get()).toBe(42);
        expect(createMutableState('hello').get()).toBe('hello');
      });

      test('should use object with referential equality', () => {
        const obj = {a: 'b'};
        expect(createMutableState(obj).get()).toBe(obj);
        expect(createMutableState(obj).get()).not.toBe({a: 'b'});
        expect(createMutableState(obj).get()).toEqual({a: 'b'});
      });
    });

    describe('by function', () => {
      test('should use empty value', () => {
        expect(createMutableState(() => null).get()).toBeNull();
        expect(createMutableState(() => undefined).get()).toBeUndefined();
      });

      test('should use primitive', () => {
        expect(createMutableState(() => 42).get()).toBe(42);
        expect(createMutableState(() => 'hello').get()).toBe('hello');
      });

      test('should use object', () => {
        expect(createMutableState(() => ({a: 'b'})).get()).not.toBe({a: 'b'});
        expect(createMutableState(() => ({a: 'b'})).get()).toEqual({a: 'b'});
      });

      test('should use function', () => {
        expect(createMutableState(() => () => 1).get()()).toBe(1);
      });
    });

    describe('function evaluation', () => {
      test('should execute at get', () => {
        const initialValue = mockFn(() => 1);
        const state = createMutableState(initialValue);
        expect(initialValue).not.toBeCalled();
        state.get();
        expect(initialValue).toBeCalled();
      });

      test('should not execute at set with non-callback value', () => {
        const initialValue = mockFn(() => 1);
        const state = createMutableState(initialValue);
        expect(initialValue).not.toBeCalled();
        state.set(2);
        expect(initialValue).not.toBeCalled();
      });

      test('should execute at set with callback value', () => {
        const initialValue = mockFn(() => 1);
        const state = createMutableState(initialValue);
        expect(initialValue).not.toBeCalled();
        state.set(() => 2);
        expect(initialValue).toBeCalled();
      });

      test('should execute at set with non-callback value while observing', () => {
        const initialValue = mockFn(() => 1);
        const state = createMutableState(initialValue);
        expect(initialValue).not.toBeCalled();
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        state.observe(() => {});
        state.set(2);
        expect(initialValue).toBeCalled();
      });

      test('should not execute at observe', () => {
        const initialValue = mockFn(() => 1);
        const state = createMutableState(initialValue);
        expect(initialValue).not.toBeCalled();
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        state.observe(() => {});
        expect(initialValue).not.toBeCalled();
      });
    });
  });

  describe('when setting', () => {
    describe('basic values', () => {
      test('should set empty value', () => {
        const state1 = createMutableState<number | null>(1);
        const state2 = createMutableState<string | undefined>('hello');
        state1.set(null);
        state2.set(undefined);
        expect(state1.get()).toBeNull();
        expect(state2.get()).toBeUndefined();
      });

      test('should set primitive', () => {
        const state1 = createMutableState(1);
        const state2 = createMutableState('hello');
        state1.set(2);
        state2.set('world');
        expect(state1.get()).toBe(2);
        expect(state2.get()).toBe('world');
      });

      test('should set object with referential equality', () => {
        const state = createMutableState({});
        const obj = {};
        state.set(obj);
        expect(state.get()).toBe(obj);
      });
    });

    describe('by function', () => {
      test('should set empty value', () => {
        const state1 = createMutableState<number | null>(1);
        const state2 = createMutableState<string | undefined>('hello');
        state1.set(() => null);
        state2.set(() => undefined);
        expect(state1.get()).toBeNull();
        expect(state2.get()).toBeUndefined();
      });

      test('should set primitive', () => {
        const state1 = createMutableState(1);
        const state2 = createMutableState('hello');
        state1.set(() => 2);
        state2.set(() => 'world');
        expect(state1.get()).toBe(2);
        expect(state2.get()).toBe('world');
      });

      test('should set object', () => {
        const state = createMutableState({});
        const obj = {};
        state.set(() => obj);
        expect(state.get()).toBe(obj);
      });

      test('should set function', () => {
        const state = createMutableState(() => () => 1);
        state.set(() => () => 2);
        expect(state.get()()).toBe(2);
      });
    });
  });

  describe('when observing', () => {
    describe('then monitoring', () => {
      test('should fire when non-empty value is set', () => {
        const state = createMutableState<number | null>(null);
        const observer = mockFn();
        state.observe(observer);
        expect(observer).not.toBeCalled();
        state.set(1);
        expect(observer).toBeCalled();
      });

      test('should fire when new primitive value is set', () => {
        const state = createMutableState(1);
        const observer = mockFn();
        state.observe(observer);
        expect(observer).not.toBeCalled();
        state.set(2);
        expect(observer).toBeCalled();
      });

      test('should fire when new object value is set', () => {
        const state = createMutableState({});
        const observer = mockFn();
        state.observe(observer);
        expect(observer).not.toBeCalled();
        state.set({});
        expect(observer).toBeCalled();
      });

      test('should fire when same empty value is set', () => {
        const state = createMutableState(null);
        const observer = mockFn();
        state.observe(observer);
        expect(observer).not.toBeCalled();
        state.set(null);
        expect(observer).toBeCalled();
      });

      test('should fire when same primitive value is set', () => {
        const state = createMutableState(1);
        const observer = mockFn();
        state.observe(observer);
        expect(observer).not.toBeCalled();
        state.set(1);
        expect(observer).toBeCalled();
      });

      test('should fire when same object value is set', () => {
        const obj = {};
        const state = createMutableState(obj);
        const observer = mockFn();
        state.observe(observer);
        expect(observer).not.toBeCalled();
        state.set(obj);
        expect(observer).toBeCalled();
      });

      test('should fire multiple', () => {
        const state = createMutableState(1);
        const observer1 = mockFn();
        const observer2 = mockFn();
        const observer3 = mockFn();
        state.observe(observer1);
        state.observe(observer2);
        state.observe(observer3);
        expect(observer1).not.toBeCalled();
        expect(observer2).not.toBeCalled();
        expect(observer3).not.toBeCalled();
        state.set(2);
        expect(observer1).toBeCalled();
        expect(observer2).toBeCalled();
        expect(observer3).toBeCalled();
      });

      test('should fire the same observer multiple times', () => {
        const state = createMutableState(1);
        const observer = mockFn();
        state.observe(observer);
        state.observe(observer);
        state.observe(observer);
        expect(observer).not.toBeCalled();
        state.set(2);
        expect(observer).toBeCalledTimes(3);
      });
    });

    describe('then unobserving', () => {
      test('should no longer fire', () => {
        const state = createMutableState(1);
        const observer = mockFn();
        const unobserve = state.observe(observer);
        expect(observer).not.toBeCalled();
        state.set(2);
        expect(observer).toBeCalledTimes(1);
        unobserve();
        state.set(3);
        expect(observer).toBeCalledTimes(1);
      });

      test('should do nothing more than once', () => {
        const state = createMutableState(1);
        const observer1 = mockFn();
        const observer2 = mockFn();
        const observer3 = mockFn();
        const unobserve1 = state.observe(observer1);
        state.observe(observer2);
        state.observe(observer3);
        expect(observer1).not.toBeCalled();
        expect(observer2).not.toBeCalled();
        expect(observer3).not.toBeCalled();
        unobserve1();
        unobserve1();
        unobserve1();
        state.set(2);
        expect(observer1).not.toBeCalled();
        expect(observer2).toBeCalled();
        expect(observer3).toBeCalled();
      });
    });
  });
});
