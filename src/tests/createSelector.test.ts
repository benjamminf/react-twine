import createSelector from '../createSelector';
import createState from '../createState';
import {mockFn} from './testUtils';

describe('createSelector()', () => {
  describe('when getting', () => {
    test('should return constant value', () => {
      const selector = createSelector(() => 1);
      expect(selector.get()).toBe(1);
    });

    test('should return value from dependent state', () => {
      const state = createState(1);
      const selector = createSelector(({get}) => get(state) * 2);
      expect(selector.get()).toBe(2);
      state.set(2);
      expect(selector.get()).toBe(4);
      state.set(3);
      expect(selector.get()).toBe(6);
    });

    test('should return value from dependent selector', () => {
      const selector1 = createSelector(() => 1);
      const selector2 = createSelector(({get}) => get(selector1) * 2);
      expect(selector2.get()).toBe(2);
    });

    test('should return value from dependent state and selector', () => {
      const state = createState(1);
      const selector1 = createSelector(({get}) => get(state) * 2);
      const selector2 = createSelector(({get}) => get(selector1) * -1);
      expect(selector2.get()).toBe(-2);
      state.set(2);
      expect(selector2.get()).toBe(-4);
      state.set(3);
      expect(selector2.get()).toBe(-6);
    });

    test('should return value from multiple dependent state', () => {
      const state1 = createState(1);
      const state2 = createState(2);
      const selector = createSelector(({get}) => get(state1) + get(state2));
      expect(selector.get()).toBe(3);
      state1.set(2);
      expect(selector.get()).toBe(4);
      state2.set(3);
      expect(selector.get()).toBe(5);
    });

    test('should return value from multiple dependent selectors', () => {
      const selector1 = createSelector(() => 1);
      const selector2 = createSelector(() => 2);
      const selector3 = createSelector(
        ({get}) => get(selector1) + get(selector2)
      );
      expect(selector3.get()).toBe(3);
    });

    test('should return value from multiple dependent state and selectors', () => {
      const state1 = createState(1);
      const state2 = createState(2);
      const selector1 = createSelector(({get}) => get(state1) * 2);
      const selector2 = createSelector(({get}) => get(state2) * -1);
      const selector3 = createSelector(
        ({get}) => get(selector1) + get(selector2)
      );
      expect(selector3.get()).toBe(0);
      state1.set(2);
      expect(selector3.get()).toBe(2);
      state2.set(3);
      expect(selector3.get()).toBe(1);
    });
  });

  describe('when observing', () => {
    test('should fire when new value is computed', () => {
      const state = createState(1);
      const selector = createSelector(({get}) => get(state) ** 2);
      const observer = mockFn();
      selector.observe(observer);
      expect(observer).not.toBeCalled();
      state.set(2);
      expect(observer).toBeCalled();
    });

    test('should not fire when same value is computed', () => {
      const state = createState(1);
      const selector = createSelector(({get}) => get(state) ** 2);
      const observer = mockFn();
      selector.observe(observer);
      expect(observer).not.toBeCalled();
      state.set(-1);
      expect(observer).not.toBeCalled();
    });
  });

  describe('computing value', () => {
    test('should not execute at creation', () => {
      const getter = mockFn(() => 1);
      createSelector(getter);
      expect(getter).not.toBeCalled();
    });

    test('should not execute with dependent state change', () => {
      const state = createState(1);
      const getter = mockFn(({get}) => get(state) * 2);
      createSelector(getter);
      state.set(2);
      expect(getter).not.toBeCalled();
    });

    test('should execute at get', () => {
      const getter = mockFn(() => 1);
      const selector = createSelector(getter);
      selector.get();
      expect(getter).toBeCalled();
    });

    test('should not execute at subsequent get with no dependent state change', () => {
      const getter = mockFn(() => 1);
      const selector = createSelector(getter);
      selector.get();
      selector.get();
      expect(getter).toBeCalledTimes(1);
    });

    test('should not execute after get with dependent state change', () => {
      const state = createState(1);
      const getter = mockFn(({get}) => get(state) * 2);
      const selector = createSelector(getter);
      selector.get();
      state.set(2);
      expect(getter).toBeCalledTimes(1);
    });

    test('should execute at subsequent get with dependent state change', () => {
      const state = createState(1);
      const getter = mockFn(({get}) => get(state) * 2);
      const selector = createSelector(getter);
      selector.get();
      state.set(2);
      selector.get();
      expect(getter).toBeCalledTimes(2);
    });

    test('should execute at observe', () => {
      const getter = mockFn(() => 1);
      const selector = createSelector(getter);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      selector.observe(() => {});
      expect(getter).toBeCalled();
    });

    test('should execute after observe with dependent state change', () => {
      const state = createState(1);
      const getter = mockFn(({get}) => get(state) * 2);
      const selector = createSelector(getter);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      selector.observe(() => {});
      state.set(2);
      expect(getter).toBeCalledTimes(2);
    });

    test('should not execute at unobserve', () => {
      const state = createState(1);
      const getter = mockFn(({get}) => get(state) * 2);
      const selector = createSelector(getter);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const unobserve = selector.observe(() => {});
      unobserve();
      expect(getter).toBeCalledTimes(1);
    });

    test('should not execute after unobserve with dependent state change', () => {
      const state = createState(1);
      const getter = mockFn(({get}) => get(state) * 2);
      const selector = createSelector(getter);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const unobserve = selector.observe(() => {});
      unobserve();
      state.set(2);
      expect(getter).toBeCalledTimes(1);
    });
  });
});
