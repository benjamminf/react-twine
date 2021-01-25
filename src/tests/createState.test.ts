import createState from '../createState';

describe('when initializing with defaults', () => {
  describe('by value', () => {
    test('should use empty value', () => {
      expect(createState(null).get()).toBeNull();
      expect(createState(undefined).get()).toBeUndefined();
    });

    test('should use primitive', () => {
      expect(createState(42).get()).toBe(42);
      expect(createState('hello').get()).toBe('hello');
    });

    test('should use object with referential equality', () => {
      const obj = {a: 'b'};
      expect(createState(obj).get()).toBe(obj);
      expect(createState(obj).get()).not.toBe({a: 'b'});
      expect(createState(obj).get()).toEqual({a: 'b'});
    });
  });

  describe('by function', () => {
    test('should use empty value', () => {
      expect(createState(() => null).get()).toBeNull();
      expect(createState(() => undefined).get()).toBeUndefined();
    });

    test('should use primitive', () => {
      expect(createState(() => 42).get()).toBe(42);
      expect(createState(() => 'hello').get()).toBe('hello');
    });

    test('should use object', () => {
      expect(createState(() => ({a: 'b'})).get()).not.toBe({a: 'b'});
      expect(createState(() => ({a: 'b'})).get()).toEqual({a: 'b'});
    });

    test('should use function', () => {
      expect(createState(() => () => 1).get()()).toBe(1);
    });
  });

  describe('function evaluation', () => {
    test('should execute at get', () => {
      let hasExecuted = false;
      const state = createState(() => {
        hasExecuted = true;
        return 1;
      });
      expect(hasExecuted).toBeFalsy();
      state.get();
      expect(hasExecuted).toBeTruthy();
    });

    test('should execute at set', () => {
      let hasExecuted = false;
      const state = createState(() => {
        hasExecuted = true;
        return 1;
      });
      expect(hasExecuted).toBeFalsy();
      state.set(2);
      expect(hasExecuted).toBeTruthy();
    });

    test('should not execute at observe', () => {
      let hasExecuted = false;
      const state = createState(() => {
        hasExecuted = true;
        return 1;
      });
      expect(hasExecuted).toBeFalsy();
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      state.observe(() => {});
      expect(hasExecuted).toBeFalsy();
    });
  });
});

describe('when setting', () => {
  describe('basic values', () => {
    test('should set empty value', () => {
      const state1 = createState<number | null>(1);
      const state2 = createState<string | undefined>('hello');
      state1.set(null);
      state2.set(undefined);
      expect(state1.get()).toBeNull();
      expect(state2.get()).toBeUndefined();
    });

    test('should set primitive', () => {
      const state1 = createState(1);
      const state2 = createState('hello');
      state1.set(2);
      state2.set('world');
      expect(state1.get()).toBe(2);
      expect(state2.get()).toBe('world');
    });

    test('should set object with referential equality', () => {
      const state = createState({});
      const obj = {};
      state.set(obj);
      expect(state.get()).toBe(obj);
    });
  });

  describe('by function', () => {
    test('should set empty value', () => {
      const state1 = createState<number | null>(1);
      const state2 = createState<string | undefined>('hello');
      state1.set(() => null);
      state2.set(() => undefined);
      expect(state1.get()).toBeNull();
      expect(state2.get()).toBeUndefined();
    });

    test('should set primitive', () => {
      const state1 = createState(1);
      const state2 = createState('hello');
      state1.set(() => 2);
      state2.set(() => 'world');
      expect(state1.get()).toBe(2);
      expect(state2.get()).toBe('world');
    });

    test('should set object', () => {
      const state = createState({});
      const obj = {};
      state.set(() => obj);
      expect(state.get()).toBe(obj);
    });

    test('should set function', () => {
      const state = createState(() => () => 1);
      state.set(() => () => 2);
      expect(state.get()()).toBe(2);
    });
  });
});

describe('when observing', () => {
  describe('then monitoring', () => {
    test('should fire when non-empty value is set', () => {
      const state = createState<number | null>(null);
      let hasObserved = false;
      state.observe(() => {
        hasObserved = true;
      });
      expect(hasObserved).toBeFalsy();
      state.set(1);
      expect(hasObserved).toBeTruthy();
    });

    test('should fire when new primitive value is set', () => {
      const state = createState(1);
      let hasObserved = false;
      state.observe(() => {
        hasObserved = true;
      });
      expect(hasObserved).toBeFalsy();
      state.set(2);
      expect(hasObserved).toBeTruthy();
    });

    test('should fire when new object value is set', () => {
      const state = createState({});
      let hasObserved = false;
      state.observe(() => {
        hasObserved = true;
      });
      expect(hasObserved).toBeFalsy();
      state.set({});
      expect(hasObserved).toBeTruthy();
    });

    test('should not fire when same empty value is set', () => {
      const state = createState(null);
      let hasObserved = false;
      state.observe(() => {
        hasObserved = true;
      });
      expect(hasObserved).toBeFalsy();
      state.set(null);
      expect(hasObserved).toBeFalsy();
    });

    test('should not fire when same primitive value is set', () => {
      const state = createState(1);
      let hasObserved = false;
      state.observe(() => {
        hasObserved = true;
      });
      expect(hasObserved).toBeFalsy();
      state.set(1);
      expect(hasObserved).toBeFalsy();
    });

    test('should not fire when same object value is set', () => {
      const obj = {};
      const state = createState(obj);
      let hasObserved = false;
      state.observe(() => {
        hasObserved = true;
      });
      expect(hasObserved).toBeFalsy();
      state.set(obj);
      expect(hasObserved).toBeFalsy();
    });

    test('should fire multiple', () => {
      const state = createState(1);
      let hasObserved1 = false;
      let hasObserved2 = false;
      let hasObserved3 = false;
      state.observe(() => {
        hasObserved1 = true;
      });
      state.observe(() => {
        hasObserved2 = true;
      });
      state.observe(() => {
        hasObserved3 = true;
      });
      expect(hasObserved1).toBeFalsy();
      expect(hasObserved2).toBeFalsy();
      expect(hasObserved3).toBeFalsy();
      state.set(2);
      expect(hasObserved1).toBeTruthy();
      expect(hasObserved2).toBeTruthy();
      expect(hasObserved3).toBeTruthy();
    });

    test('should not fire the same observer multiple times', () => {
      const state = createState(1);
      let observedCount = 0;
      const observer = () => {
        observedCount++;
      };
      state.observe(observer);
      state.observe(observer);
      state.observe(observer);
      expect(observedCount).toBe(0);
      state.set(2);
      expect(observedCount).toBe(1);
    });
  });

  describe('then unobserving', () => {
    test('should no longer fire', () => {
      const state = createState(1);
      let observedCount = 0;
      const unobserve = state.observe(() => {
        observedCount++;
      });
      expect(observedCount).toBe(0);
      state.set(2);
      expect(observedCount).toBe(1);
      unobserve();
      state.set(3);
      expect(observedCount).toBe(1);
    });

    test('should do nothing more than once', () => {
      const state = createState(1);
      let hasObserved1 = false;
      let hasObserved2 = false;
      let hasObserved3 = false;
      const unobserve1 = state.observe(() => {
        hasObserved1 = true;
      });
      state.observe(() => {
        hasObserved2 = true;
      });
      state.observe(() => {
        hasObserved3 = true;
      });
      expect(hasObserved1).toBeFalsy();
      expect(hasObserved2).toBeFalsy();
      expect(hasObserved3).toBeFalsy();
      unobserve1();
      unobserve1();
      unobserve1();
      state.set(2);
      expect(hasObserved1).toBeFalsy();
      expect(hasObserved2).toBeTruthy();
      expect(hasObserved3).toBeTruthy();
    });
  });
});
