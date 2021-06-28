import { box, unbox } from './box';
import {
  Box,
  Cleanup,
  DependencyStatus,
  DependencyStore,
  Effect,
  Getter,
  GetterContext,
  Observer,
  Selector,
  SelectorCreator,
  Transactor,
  Uneffect,
  Unobserver,
} from './types';

export function bootstrapSelector({
  dependencyStore,
  transactor,
}: {
  dependencyStore: DependencyStore<symbol>;
  transactor: Transactor;
}): SelectorCreator {
  return function createSelector<T>(getter: Getter<T>): Selector<T> {
    const key = Symbol();
    const observers = new Set<Observer<T>>();
    const effects = new Set<Effect>();
    const cleanups = new Set<Cleanup>();
    let dependencies = new Map<Selector<unknown>, unknown>();
    let current: Box<T> | undefined;
    let past: Box<T> | undefined;
    let isComputing = false;

    const context: GetterContext = {
      get: dependency => {
        const value = dependency.get();

        dependencyStore.addDependency(key, dependency.key);
        dependencies.set(dependency, value);

        return value;
      },
    };

    function compute(): void {
      dependencyStore.removeDependencies(key);
      dependencies = new Map();
      past = current;
      current = box(getter(context));

      // TODO use this for firing observers
      const hasChanged = !past || unbox(past) !== unbox(current);
    }

    function prepare(): void {
      if (isComputing) {
        // TODO dependencyStore.findCycle(key);
        throw new Error('Circular dependencyStore detected');
      }

      // Should be fine to do this and not unnecessarily compute a dependency as
      // long as we do it in the order of the get(dependency) calls
      const shouldCompute = !Array.from(dependencies).every(
        ([dependency, value]) => Object.is(dependency.get(), value),
      );

      if (shouldCompute) {
        isComputing = true;
        compute();
        isComputing = false;
      }
    }

    function get(): T {
      const status = dependencyStore.getStatus(key);

      if (status === DependencyStatus.Stale) {
        prepare();
        dependencyStore.markStatus(key, DependencyStatus.Fresh);
      }

      return unbox(current!);
    }

    function trigger() {
      // if status is stale, changed, and has observers
    }

    dependencyStore.observeStatus(key, status => {
      transactor.finalize(trigger);
    });

    function observe(observer: Observer<T>): Unobserver {
      if (observers.size === 0) {
        // Run effect
      }

      observers.add(observer);

      return () => {
        if (observers.has(observer)) {
          observers.delete(observer);

          if (observers.size === 0) {
            // Run effect cleanup
          }
        }
      };
    }

    function effect(effect: Effect): Uneffect {
      effects.add(effect);

      return () => effects.delete(effect);
    }

    return {
      key,
      get,
      observe,
      effect,
    };
  };
}

export function isSelector<T>(obj: unknown): obj is Selector<T> {
  return (
    typeof obj === 'object' &&
    obj != null &&
    typeof (obj as Selector<T>).key === 'symbol' &&
    typeof (obj as Selector<T>).get === 'function' &&
    typeof (obj as Selector<T>).observe === 'function' &&
    typeof (obj as Selector<T>).effect === 'function'
  );
}
