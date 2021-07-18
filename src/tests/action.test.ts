import { ActionCreator, bootstrapAction } from '../action';
import { createDependencyStore } from '../dependencyStore';
import { SelectorCreator, bootstrapSelector } from '../selector';
import { StateCreator, bootstrapState } from '../state';
import { createTransactor } from '../transactor';

describe('createAction()', () => {
  let createAction: ActionCreator;
  let createSelector: SelectorCreator;
  let createState: StateCreator;

  beforeEach(() => {
    const dependencyStore = createDependencyStore();
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

  describe('when dispatching', () => {
    test('should set value', () => {
      const state = createState(1);
      const action = createAction(({ set }) => set(state, 2));
      expect(state.get()).toBe(1);
      action.dispatch();
      expect(state.get()).toBe(2);
    });

    test('should set multiple values', () => {
      const state1 = createState(1);
      const state2 = createState('hello');
      const action = createAction(({ set }) => {
        set(state1, 2);
        set(state2, 'world');
      });
      expect(state1.get()).toBe(1);
      expect(state2.get()).toBe('hello');
      action.dispatch();
      expect(state1.get()).toBe(2);
      expect(state2.get()).toBe('world');
    });

    test('should set value by function', () => {
      const state = createState(1);
      const action = createAction(({ set }) => set(state, value => value + 1));
      expect(state.get()).toBe(1);
      action.dispatch();
      expect(state.get()).toBe(2);
    });

    test('should set multiple values by function', () => {
      const state1 = createState(1);
      const state2 = createState('hello');
      const action = createAction(({ set }) => {
        set(state1, value => value + 1);
        set(state2, () => 'world');
      });
      expect(state1.get()).toBe(1);
      expect(state2.get()).toBe('hello');
      action.dispatch();
      expect(state1.get()).toBe(2);
      expect(state2.get()).toBe('world');
    });

    test('should set value by payload', () => {
      const state = createState(1);
      const action = createAction<number>(({ set }, value) =>
        set(state, value),
      );
      expect(state.get()).toBe(1);
      action.dispatch(2);
      expect(state.get()).toBe(2);
    });

    test('should set multiple values by payload', () => {
      const state1 = createState(1);
      const state2 = createState('hello');
      const action = createAction<[number, string]>(({ set }, value) => {
        set(state1, value[0]);
        set(state2, value[1]);
      });
      expect(state1.get()).toBe(1);
      expect(state2.get()).toBe('hello');
      action.dispatch([2, 'world']);
      expect(state1.get()).toBe(2);
      expect(state2.get()).toBe('world');
    });

    test('should get and set value', () => {
      const state = createState(1);
      const action = createAction(({ get, set }) => {
        set(state, get(state) + 1);
      });
      expect(state.get()).toBe(1);
      action.dispatch();
      expect(state.get()).toBe(2);
    });

    test('should throw error when setting asynchronously', () => {
      const state = createState(1);
      const action = createAction(({ set }) => {
        setTimeout(() => {
          expect(set(state, 2)).toThrowError();
        }, 0);
      });
      action.dispatch();
    });

    test('should not error when dispatching asynchronously', () => {
      const state = createState(1);
      const action1 = createAction<number>(({ set }, value) =>
        set(state, value),
      );
      const action2 = createAction(({ dispatch }) => {
        setTimeout(() => {
          expect(dispatch(action1, 2)).not.toThrowError();
        }, 0);
      });
      action2.dispatch();
    });
  });

  describe('when observing', () => {
    test('should fire once with one set', () => {
      const state = createState(1);
      const action = createAction(({ set }) => set(state, 2));
      const observer = jest.fn();
      state.observe(observer);
      expect(state.get()).toBe(1);
      expect(observer).not.toBeCalled();
      action.dispatch();
      expect(state.get()).toBe(2);
      expect(observer).toBeCalled();
    });

    test('should fire once with multiple sets on same state', () => {
      const state = createState(1);
      const action = createAction(({ set }) => {
        set(state, 2);
        set(state, 3);
        set(state, 4);
      });
      const observer = jest.fn();
      state.observe(observer);
      expect(state.get()).toBe(1);
      expect(observer).not.toBeCalled();
      action.dispatch();
      expect(state.get()).toBe(4);
      expect(observer).toBeCalledTimes(1);
    });

    test('should fire multiple with multiple sets on differing state', () => {
      const state1 = createState(1);
      const state2 = createState(2);
      const state3 = createState(3);
      const action = createAction(({ set }) => {
        set(state1, 4);
        set(state2, 5);
        set(state3, 6);
      });
      const observer = jest.fn();
      state1.observe(observer);
      state2.observe(observer);
      state3.observe(observer);
      expect(state1.get()).toBe(1);
      expect(state2.get()).toBe(2);
      expect(state3.get()).toBe(3);
      expect(observer).not.toBeCalled();
      action.dispatch();
      expect(state1.get()).toBe(4);
      expect(state2.get()).toBe(5);
      expect(state3.get()).toBe(6);
      expect(observer).toBeCalledTimes(3);
    });

    test('should fire once with multiple sets on same state using nested actions', () => {
      const state = createState(1);
      const action1 = createAction(({ set }) => set(state, 2));
      const action2 = createAction(({ set }) => {
        action1.dispatch();
        set(state, 3);
      });
      const action3 = createAction(({ set }) => {
        action2.dispatch();
        set(state, 4);
      });
      const observer = jest.fn();
      state.observe(observer);
      expect(state.get()).toBe(1);
      expect(observer).not.toBeCalled();
      action3.dispatch();
      expect(state.get()).toBe(4);
      expect(observer).toBeCalledTimes(1);
    });

    test('should fire multiple with multiple sets on differing state using nested actions', () => {
      const state1 = createState(1);
      const state2 = createState(2);
      const state3 = createState(3);
      const action1 = createAction(({ set }) => set(state1, 4));
      const action2 = createAction(({ set }) => {
        action1.dispatch();
        set(state2, 5);
      });
      const action3 = createAction(({ set }) => {
        action2.dispatch();
        set(state3, 6);
      });
      const observer = jest.fn();
      state1.observe(observer);
      state2.observe(observer);
      state3.observe(observer);
      expect(state1.get()).toBe(1);
      expect(state2.get()).toBe(2);
      expect(state3.get()).toBe(3);
      expect(observer).not.toBeCalled();
      action3.dispatch();
      expect(state1.get()).toBe(4);
      expect(state2.get()).toBe(5);
      expect(state3.get()).toBe(6);
      expect(observer).toBeCalledTimes(3);
    });

    test('should fire once with multiple sets on different state using selector', () => {
      const state1 = createState(3);
      const state2 = createState(5);
      const selector = createSelector(({ get }) => get(state1) * get(state2));
      const action = createAction(({ set }) => {
        set(state1, 4);
        set(state2, 6);
      });
      const observer = jest.fn();
      selector.observe(observer);
      action.dispatch();
      expect(observer).toBeCalledTimes(1);
    });
  });
});
