import { Box, box, unbox } from './box';
import { DependencyStore, DependencyStatus } from './dependencyStore';
import { Transactor } from './transactor';
import {
  Cleanup,
  Effect,
  EffectOptions,
  Getter,
  Observer,
  ObserverOptions,
  Selector,
  Uneffect,
  Unobserver,
} from './types';

export type SelectorOptions<T> = Partial<{
  equals: (a: T, b: T) => boolean;
  cleanup: (value: T) => void;
}>;

export type SelectorCreator = <T>(
  getter: Getter<T>,
  options?: SelectorOptions<T>,
) => Selector<T>;

export function bootstrapSelector({
  dependencyStore,
  transactor,
}: {
  dependencyStore: DependencyStore<symbol>;
  transactor: Transactor;
}): SelectorCreator {
  return function createSelector<T>(
    getter: Getter<T>,
    { equals = Object.is, cleanup }: SelectorOptions<T> = {},
  ): Selector<T> {
    const key = Symbol();
    const observers = new Set<Observer<T>>();
    const unobservers = new Set<Unobserver>();
    const effects = new Set<Effect>();
    const cleanups = new Set<Cleanup>();
    const dependencies = new Map<symbol, Unobserver>();
    let current: Box<T> | undefined;
    let past: Box<T> | undefined;
    let computeCounter = 0;
    let shouldCompute = true;
    let isComputing = false;

    function markComputable() {
      shouldCompute = true;
    }

    function cleanupDependencies(
      dependencyKeys = new Set(dependencies.keys()),
    ): void {
      dependencyKeys.forEach(dependencyKey => {
        dependencies.get(dependencyKey)?.();
        dependencies.delete(dependencyKey);
        dependencyStore.removeDependency(key, dependencyKey);
      });
    }

    function compute(): void {
      const count = ++computeCounter;
      const pastDependencies = new Set(dependencies.keys());
      const value = getter({
        get: dependency => {
          dependencyStore.addDependency(key, dependency.key);
          pastDependencies.delete(dependency.key);

          if (
            observers.size > 0 &&
            count === computeCounter &&
            !dependencies.has(dependency.key)
          ) {
            dependencies.set(
              dependency.key,
              dependency.observe(markComputable),
            );
          }

          return dependency.get();
        },
      });

      // TODO only keep past/current values when observed
      past = current;
      current = box(value);

      cleanupDependencies(pastDependencies);
    }

    function prepare(): void {
      if (isComputing) {
        // TODO dependencyStore.findCycle(key);
        throw new Error('Circular dependencyStore detected');
      }

      if (shouldCompute) {
        isComputing = true;
        compute();
        isComputing = false;
        shouldCompute = observers.size === 0 || dependencies.size === 0;
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
      const hasChanged = !past || !equals(oldValue as T, value);

      if (hasChanged) {
        Array.from(observers).forEach(observer => {
          observer(value, oldValue);
        });

        const pastUnobservers = Array.from(unobservers);
        unobservers.clear();
        pastUnobservers.forEach(unobserver => unobserver());
      }
    }

    function statusObserver(status: DependencyStatus): void {
      if (status === DependencyStatus.Stale) {
        transactor.finalize(triggerObservers);
      }
    }

    effects.add(() => {
      get();
      const unobserveStatus = dependencyStore.observeStatus(
        key,
        statusObserver,
      );
      return () => {
        unobserveStatus();
        cleanupDependencies();
      };
    });

    function observe(
      observer: Observer<T>,
      {
        once = false,
        immediate = false,
        passive = false,
      }: ObserverOptions = {},
    ): Unobserver {
      if (observers.size === 0) {
        triggerEffects();
      }

      observers.add(observer);

      const unobserver = () => {
        if (observers.has(observer)) {
          observers.delete(observer);
          if (observers.size === 0) {
            triggerCleanups();
          }
        }
      };

      if (once) {
        unobservers.add(unobserver);
      }

      return unobserver;
    }

    // effects, when should they be called?
    // the problem with the current approach is that it only triggers when the
    // selector is directly observed. It doesn't trigger if it's a descendent
    // from the selector that becomes observed.
    function effect(effect: Effect, options: EffectOptions = {}): Uneffect {
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
