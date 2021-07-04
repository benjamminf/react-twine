import { ActionCreator, bootstrapAction } from '../action';
import { createDependencyStore, DependencyStore } from '../dependencyStore';
import { SelectorCreator, bootstrapSelector } from '../selector';
import { StateCreator, bootstrapState } from '../state';
import { createTransactor } from '../transactor';
import { Selector } from '../types';

describe('createSelector()', () => {
  let dependencyStore: DependencyStore<symbol>;
  let createAction: ActionCreator;
  let createSelector: SelectorCreator;
  let createState: StateCreator;

  beforeEach(() => {
    dependencyStore = createDependencyStore();
    const transactor = createTransactor();

    createAction = bootstrapAction({
      transactor,
    });
    createSelector = bootstrapSelector({
      dependencyStore,
      transactor,
    });
    createState = bootstrapState({
      dependencyStore,
      transactor,
      createSelector,
    });
  });

  describe('when getting', () => {
    test('should return constant value', () => {
      const selector = createSelector(() => 1);
      expect(selector.get()).toBe(1);
    });

    test('should return function value', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const fn = () => {};
      const selector = createSelector(() => fn);
      expect(selector.get()).toBe(fn);
    });

    test('should return value from dependent state', () => {
      const state = createState(1);
      const selector = createSelector(({ get }) => get(state) * 2);
      expect(selector.get()).toBe(2);
      state.set(2);
      expect(selector.get()).toBe(4);
      state.set(3);
      expect(selector.get()).toBe(6);
    });

    test('should return value from dependent selector', () => {
      const selector1 = createSelector(() => 1);
      const selector2 = createSelector(({ get }) => get(selector1) * 2);
      expect(selector2.get()).toBe(2);
    });

    test('should return value from dependent state and selector', () => {
      const state = createState(1);
      const selector1 = createSelector(({ get }) => get(state) * 2);
      const selector2 = createSelector(({ get }) => get(selector1) * -1);
      expect(selector2.get()).toBe(-2);
      state.set(2);
      expect(selector2.get()).toBe(-4);
      state.set(3);
      expect(selector2.get()).toBe(-6);
    });

    test('should return value from multiple dependent state', () => {
      const state1 = createState(1);
      const state2 = createState(2);
      const selector = createSelector(({ get }) => get(state1) + get(state2));
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
        ({ get }) => get(selector1) + get(selector2),
      );
      expect(selector3.get()).toBe(3);
    });

    test('should return value from multiple dependent state and selectors', () => {
      const state1 = createState(1);
      const state2 = createState(2);
      const selector1 = createSelector(({ get }) => get(state1) * 2);
      const selector2 = createSelector(({ get }) => get(state2) * -1);
      const selector3 = createSelector(
        ({ get }) => get(selector1) + get(selector2),
      );
      expect(selector3.get()).toBe(0);
      state1.set(2);
      expect(selector3.get()).toBe(2);
      state2.set(3);
      expect(selector3.get()).toBe(1);
    });

    test('should execute getters the least amount of times required', () => {
      const state = createState(1);
      const getter1 = jest.fn(({ get }) => get(state) * 2);
      const selector1 = createSelector(getter1);
      const getter2 = jest.fn(({ get }) => get(selector1) * 2);
      const selector2 = createSelector(getter2);
      const getter3 = jest.fn(({ get }) => get(selector2) * 2);
      const selector3 = createSelector(getter3);
      expect(getter1).toBeCalledTimes(0);
      expect(getter2).toBeCalledTimes(0);
      expect(getter3).toBeCalledTimes(0);
      selector3.get();
      state.set(2);
      expect(getter1).toBeCalledTimes(1);
      expect(getter2).toBeCalledTimes(1);
      expect(getter3).toBeCalledTimes(1);
      selector3.get();
      expect(getter1).toBeCalledTimes(2);
      expect(getter2).toBeCalledTimes(2);
      expect(getter3).toBeCalledTimes(2);
    });

    test('should throw error when recursively selecting itself', () => {
      const selector: Selector<unknown> = createSelector(({ get }) =>
        get(selector),
      );
      expect(selector.get).toThrowError();
    });

    test('should throw error with a circular dependency', () => {
      const selector1: Selector<unknown> = createSelector(({ get }) =>
        get(selector3),
      );
      const selector2: Selector<unknown> = createSelector(({ get }) =>
        get(selector1),
      );
      const selector3: Selector<unknown> = createSelector(({ get }) =>
        get(selector2),
      );
      expect(selector1.get).toThrowError();
      expect(selector2.get).toThrowError();
      expect(selector3.get).toThrowError();
    });
  });

  describe('when observing', () => {
    test('should fire when new value is computed', () => {
      const state = createState(1);
      const selector = createSelector(({ get }) => get(state) ** 2);
      const observer = jest.fn();
      selector.observe(observer);
      expect(observer).not.toBeCalled();
      state.set(2);
      expect(observer).toBeCalled();
    });

    test('should not fire when same value is computed', () => {
      const state = createState(1);
      const selector = createSelector(({ get }) => get(state) ** 2);
      const observer = jest.fn();
      selector.observe(observer);
      expect(observer).not.toBeCalled();
      state.set(-1);
      expect(observer).not.toBeCalled();
    });
  });

  describe('computing value', () => {
    test('should not execute at creation', () => {
      const getter = jest.fn(() => 1);
      createSelector(getter);
      expect(getter).not.toBeCalled();
    });

    test('should not execute with dependent state change', () => {
      const state = createState(1);
      const getter = jest.fn(({ get }) => get(state) * 2);
      createSelector(getter);
      state.set(2);
      expect(getter).not.toBeCalled();
    });

    test('should execute at get', () => {
      const getter = jest.fn(() => 1);
      const selector = createSelector(getter);
      selector.get();
      expect(getter).toBeCalled();
    });

    test('should not execute at subsequent get with no dependent state change', () => {
      const getter = jest.fn(() => 1);
      const selector = createSelector(getter);
      selector.get();
      selector.get();
      expect(getter).toBeCalledTimes(1);
    });

    test('should not execute after get with dependent state change', () => {
      const state = createState(1);
      const getter = jest.fn(({ get }) => get(state) * 2);
      const selector = createSelector(getter);
      selector.get();
      state.set(2);
      expect(getter).toBeCalledTimes(1);
    });

    test('should execute at subsequent get with dependent state change', () => {
      const state = createState(1);
      const getter = jest.fn(({ get }) => get(state) * 2);
      const selector = createSelector(getter);
      selector.get();
      state.set(2);
      selector.get();
      expect(getter).toBeCalledTimes(2);
    });

    test('should execute at observe', () => {
      const getter = jest.fn(() => 1);
      const selector = createSelector(getter);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      selector.observe(() => {});
      expect(getter).toBeCalled();
    });

    test('should execute after observe with dependent state change', () => {
      const state = createState(1);
      const getter = jest.fn(({ get }) => get(state) * 2);
      const selector = createSelector(getter);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      selector.observe(() => {});
      state.set(2);
      expect(getter).toBeCalledTimes(2);
    });

    test('should not execute at unobserve', () => {
      const state = createState(1);
      const getter = jest.fn(({ get }) => get(state) * 2);
      const selector = createSelector(getter);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const unobserve = selector.observe(() => {});
      unobserve();
      expect(getter).toBeCalledTimes(1);
    });

    test('should not execute after unobserve with dependent state change', () => {
      const state = createState(1);
      const getter = jest.fn(({ get }) => get(state) * 2);
      const selector = createSelector(getter);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const unobserve = selector.observe(() => {});
      unobserve();
      state.set(2);
      expect(getter).toBeCalledTimes(1);
    });

    test('should only execute twice after observe with multiple dependent state changes', () => {
      const state1 = createState(1);
      const state2 = createState(2);
      const state3 = createState(3);
      const action = createAction(({ set }) => {
        set(state1, 4);
        set(state2, 5);
        set(state3, 6);
      });
      const getter = jest.fn(
        ({ get }) => get(state1) + get(state2) + get(state3),
      );
      const selector = createSelector(getter);
      const observer = jest.fn();
      selector.observe(observer);
      action.dispatch();
      expect(getter).toBeCalledTimes(2);
      expect(observer).toBeCalledTimes(1);
    });

    test('should only execute twice after observe with dependent state change and dependent selector recomputation', () => {
      const state = createState(1);
      const getter1 = jest.fn(({ get }) => get(state) * 2);
      const selector1 = createSelector(getter1);
      const getter2 = jest.fn(({ get }) => get(selector1) * 2);
      const selector2 = createSelector(getter2);
      const observer = jest.fn();
      selector2.observe(observer);
      state.set(2);
      expect(state.get()).toBe(2);
      expect(selector1.get()).toBe(4);
      expect(selector2.get()).toBe(8);
      expect(getter1).toBeCalledTimes(2);
      expect(getter2).toBeCalledTimes(2);
      expect(observer).toBeCalledTimes(1);
    });

    test('should only execute twice after observe with double dependent state change and dependent selector recomputation', () => {
      const state = createState(1);
      const getter1 = jest.fn(({ get }) => get(state) * 2);
      const selector1 = createSelector(getter1);
      const getter2 = jest.fn(({ get }) => get(state) + get(selector1));
      const selector2 = createSelector(getter2);
      const observer = jest.fn();
      selector2.observe(observer);
      state.set(2);
      expect(state.get()).toBe(2);
      expect(selector1.get()).toBe(4);
      expect(selector2.get()).toBe(6);
      expect(getter1).toBeCalledTimes(2);
      expect(getter2).toBeCalledTimes(2);
      expect(observer).toBeCalledTimes(1);
    });

    test('should only execute twice after double observe with double dependent state change and dependent selector recomputation', () => {
      const state = createState(1);
      const getter1 = jest.fn(({ get }) => get(state) * 2);
      const selector1 = createSelector(getter1);
      const getter2 = jest.fn(({ get }) => get(state) + get(selector1));
      const selector2 = createSelector(getter2);
      const observer1 = jest.fn();
      const observer2 = jest.fn();
      selector1.observe(observer1);
      selector2.observe(observer2);
      state.set(2);
      expect(state.get()).toBe(2);
      expect(selector1.get()).toBe(4);
      expect(selector2.get()).toBe(6);
      expect(getter1).toBeCalledTimes(2);
      expect(getter2).toBeCalledTimes(2);
      expect(observer1).toBeCalledTimes(1);
      expect(observer2).toBeCalledTimes(1);
    });

    test('should only execute twice after observe with dependent state change and conditionally dependent selector recomputation', () => {
      const state = createState(1);
      const getter1 = jest.fn(({ get }) => get(state) * 2);
      const observer1 = jest.fn();
      const selector1 = createSelector(getter1);
      const getter2 = jest.fn(({ get }) =>
        get(state) % 2 === 0 ? get(selector1) * 2 : 0,
      );
      const observer2 = jest.fn();
      const selector2 = createSelector(getter2);
      selector2.observe(observer2);
      selector1.observe(observer1);
      state.set(2);
      expect(state.get()).toBe(2);
      expect(selector1.get()).toBe(4);
      expect(selector2.get()).toBe(8);
      expect(getter1).toBeCalledTimes(2);
      expect(getter2).toBeCalledTimes(2);
      expect(observer1).toBeCalledTimes(1);
      expect(observer2).toBeCalledTimes(1);
    });

    test('should only execute twice after observe with dependent state change and inversely conditionally dependent selector recomputation', () => {
      const state = createState(1);
      const getter1 = jest.fn(({ get }) => get(state) * 2);
      const observer1 = jest.fn();
      const selector1 = createSelector(getter1);
      const getter2 = jest.fn(({ get }) =>
        get(state) % 2 === 1 ? get(selector1) * 2 : 0,
      );
      const observer2 = jest.fn();
      const selector2 = createSelector(getter2);
      selector2.observe(observer2);
      selector1.observe(observer1);
      state.set(2);
      expect(state.get()).toBe(2);
      expect(selector1.get()).toBe(4);
      expect(selector2.get()).toBe(0);
      expect(getter1).toBeCalledTimes(2);
      expect(getter2).toBeCalledTimes(2);
      expect(observer1).toBeCalledTimes(1);
      expect(observer2).toBeCalledTimes(1);
    });

    test('should only execute twice after all observe with all dependent state change and all dependent selector recomputation', () => {
      const state = createState(1);
      const getter1 = jest.fn(({ get }) => get(state));
      const selector1 = createSelector(getter1);
      const getter2 = jest.fn(({ get }) => get(state) + get(selector1));
      const selector2 = createSelector(getter2);
      const getter3 = jest.fn(
        ({ get }) => get(state) + get(selector1) + get(selector2),
      );
      const selector3 = createSelector(getter3);
      const getter4 = jest.fn(
        ({ get }) =>
          get(state) + get(selector1) + get(selector2) + get(selector3),
      );
      const selector4 = createSelector(getter4);
      const observer = jest.fn();
      selector1.observe(observer);
      selector2.observe(observer);
      selector3.observe(observer);
      selector4.observe(observer);
      state.set(2);
      expect(state.get()).toBe(2);
      expect(selector1.get()).toBe(2);
      expect(selector2.get()).toBe(4);
      expect(selector3.get()).toBe(8);
      expect(selector4.get()).toBe(16);
      expect(getter1).toBeCalledTimes(2);
      expect(getter2).toBeCalledTimes(2);
      expect(getter3).toBeCalledTimes(2);
      expect(getter4).toBeCalledTimes(2);
      expect(observer).toBeCalledTimes(4);
    });
  });
});
