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
    const dependencies = new Map<Selector<unknown>, unknown>();
    let current: Box<T> | undefined;
    let past: Box<T> | undefined;
    let computeCounter = 0;
    let isComputing = false;

    function compute(): void {
      const count = ++computeCounter;
      const context: GetterContext = {
        get: dependency => {
          const value = dependency.get();

          if (count === computeCounter) {
            dependencyStore.addDependency(key, dependency.key);
            dependencies.set(dependency, value);
          }

          return value;
        },
      };

      dependencyStore.removeDependencies(key);
      dependencies.clear();
      past = current;
      current = box(getter(context));
    }

    function prepare(): void {
      if (isComputing) {
        // TODO dependencyStore.findCycle(key);
        throw new Error('Circular dependencyStore detected');
      }

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

    function triggerEffects() {
      Array.from(effects).forEach(effect => {
        const cleanup = effect();
        if (cleanup) {
          cleanups.add(cleanup);
        }
      });
    }

    function triggerCleanups() {
      const pastCleanups = Array.from(cleanups);
      cleanups.clear();
      pastCleanups.forEach(cleanup => cleanup());
    }

    function triggerObservers() {
      const value = get();
      const oldValue = past && unbox(past);
      const hasChanged = !past || oldValue !== value;

      if (hasChanged) {
        Array.from(observers).forEach(observer => {
          observer(value, oldValue);
        });
      }
    }

    function observe(observer: Observer<T>): Unobserver {
      if (observers.size === 0) {
        triggerEffects();
      }

      observers.add(observer);

      return () => {
        if (observers.has(observer)) {
          observers.delete(observer);

          if (observers.size === 0) {
            triggerCleanups();
          }
        }
      };
    }

    function effect(effect: Effect): Uneffect {
      effects.add(effect);

      return () => effects.delete(effect);
    }

    function statusObserver(status: DependencyStatus): void {
      if (status === DependencyStatus.Stale) {
        transactor.finalize(triggerObservers);
      } else {
        transactor.unfinalize(triggerObservers);
      }
    }

    effects.add(() => dependencyStore.observeStatus(key, statusObserver));

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
