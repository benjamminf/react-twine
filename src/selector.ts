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
    let current: Box<T> | undefined;
    let past: Box<T> | undefined;

    const context: GetterContext = {
      get: dependency => {
        dependencyStore.link(key, dependency.key);

        return dependency.get();
      },
    };

    function compute(): void {
      dependencyStore.unlink(key); // Hmm, we only want to unlink *from* key to any, not bidirectionally
      dependencyStore.mark(key, DependencyStatus.Changing);

      past = current;
      current = box(getter(context));

      dependencyStore.mark(
        key,
        past && unbox(past) === unbox(current)
          ? DependencyStatus.Unchanged
          : DependencyStatus.Changed,
      );
    }

    function get(): T {
      const status = dependencyStore.status(key) ?? DependencyStatus.Stale;

      if (status === DependencyStatus.Changing) {
        throw new Error('Circular dependencyStore detected');
      }

      if (status === DependencyStatus.Stale) {
        compute();
      }

      return unbox(current!);
    }

    function trigger() {
      // if status is stale, changed, and has observers
    }

    dependencyStore.observe(key, status => {
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
