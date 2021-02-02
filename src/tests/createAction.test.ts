import createAction from '../createAction';
import createState from '../createState';
import {mockFn} from './testUtils';

describe('createAction()', () => {
  describe('when dispatching', () => {
    test('should set value', () => {
      const state = createState(1);
      const action = createAction((_, set) => set(state, 2));
      expect(state.get()).toBe(1);
      action.dispatch();
      expect(state.get()).toBe(2);
    });

    test('should set multiple values', () => {
      const state1 = createState(1);
      const state2 = createState('hello');
      const action = createAction((_, set) => {
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
      const action = createAction((_, set) => set(state, value => value + 1));
      expect(state.get()).toBe(1);
      action.dispatch();
      expect(state.get()).toBe(2);
    });

    test('should set multiple values by function', () => {
      const state1 = createState(1);
      const state2 = createState('hello');
      const action = createAction((_, set) => {
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
      const action = createAction((payload: number, set) =>
        set(state, payload)
      );
      expect(state.get()).toBe(1);
      action.dispatch(2);
      expect(state.get()).toBe(2);
    });

    test('should set multiple values by payload', () => {
      const state1 = createState(1);
      const state2 = createState('hello');
      const action = createAction(
        (payload: {value1: number; value2: string}, set) => {
          set(state1, payload.value1);
          set(state2, payload.value2);
        }
      );
      expect(state1.get()).toBe(1);
      expect(state2.get()).toBe('hello');
      action.dispatch({value1: 2, value2: 'world'});
      expect(state1.get()).toBe(2);
      expect(state2.get()).toBe('world');
    });

    test('should get and set value', () => {
      const state = createState(1);
      const action = createAction((_, set, get) => {
        set(state, get(state) + 1);
      });
      expect(state.get()).toBe(1);
      action.dispatch();
      expect(state.get()).toBe(2);
    });

    test('should throw error when setting asynchronously', () => {
      const state = createState(1);
      const action = createAction((_, set) => {
        setTimeout(() => {
          expect(set(state, 2)).toThrowError();
        }, 0);
      });
      action.dispatch();
    });
  });

  describe('when observing', () => {
    test('should fire once with one set', () => {
      const state = createState(1);
      const action = createAction((_, set) => set(state, 2));
      const observer = mockFn();
      state.observe(observer);
      expect(state.get()).toBe(1);
      expect(observer).not.toBeCalled();
      action.dispatch();
      expect(state.get()).toBe(2);
      expect(observer).toBeCalled();
    });

    test('should fire once with multiple sets on same state', () => {
      const state = createState(1);
      const action = createAction((_, set) => {
        set(state, 2);
        set(state, 3);
        set(state, 4);
      });
      const observer = mockFn();
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
      const action = createAction((_, set) => {
        set(state1, 4);
        set(state2, 5);
        set(state3, 6);
      });
      const observer = mockFn();
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
      const action1 = createAction((_, set) => set(state, 2));
      const action2 = createAction((_, set) => {
        action1.dispatch();
        set(state, 3);
      });
      const action3 = createAction((_, set) => {
        action2.dispatch();
        set(state, 4);
      });
      const observer = mockFn();
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
      const action1 = createAction((_, set) => set(state1, 4));
      const action2 = createAction((_, set) => {
        action1.dispatch();
        set(state2, 5);
      });
      const action3 = createAction((_, set) => {
        action2.dispatch();
        set(state3, 6);
      });
      const observer = mockFn();
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
  });
});
