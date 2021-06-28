import {
  DependencyStatus,
  DependencyStore,
  Observer,
  Unobserver,
} from './types';

function mapSetAdd<K, V>(mapSet: Map<K, Set<V>>, key: K, value: V): void {
  let set = mapSet.get(key);
  if (!set) {
    set = new Set<V>();
    mapSet.set(key, set);
  }
  set.add(value);
}

function mapSetDelete<K, V>(mapSet: Map<K, Set<V>>, key: K, value?: V): void {
  const set = mapSet.get(key);
  if (set) {
    if (value !== undefined) {
      set.delete(value);
    }
    if (value === undefined || set.size === 0) {
      mapSet.delete(key);
    }
  }
}

function crawlEdges<T>(
  edgeMap: Map<T, Set<T>>,
  root: T,
  callback: (item: T) => boolean | void,
): void {
  const rootDependents = edgeMap.get(root);

  if (!rootDependents) {
    return;
  }

  const pool = [...rootDependents];

  // TODO guard against cycles
  while (pool.length > 0) {
    const item = pool.pop()!;
    const survive = callback(item) ?? true;

    if (survive) {
      const dependents = edgeMap.get(item);
      if (dependents) {
        pool.push(...dependents);
      }
    }
  }
}

export function createDependencyStore<T>(): DependencyStore<T> {
  const statuses = new Map<T, DependencyStatus>();
  const edges = new Map<T, Set<T>>();
  const inverseEdges = new Map<T, Set<T>>();
  const observers = new Map<T, Set<Observer<DependencyStatus>>>();

  function getStatus(item: T): DependencyStatus {
    return statuses.get(item) ?? DependencyStatus.Stale;
  }

  function setStatus(item: T, status: DependencyStatus): void {
    if (status === DependencyStatus.Stale) {
      statuses.delete(item);
    } else {
      statuses.set(item, status);
    }
  }

  function markStatus(item: T, status: DependencyStatus): void {
    if (getStatus(item) === status) {
      return;
    }

    setStatus(item, status);
    triggerObservers(item);

    if (status !== DependencyStatus.Stale) {
      return;
    }

    crawlEdges(inverseEdges, item, current => {
      if (getStatus(current) === DependencyStatus.Stale) {
        return false;
      }

      setStatus(current, DependencyStatus.Stale);
      triggerObservers(current);
    });
  }

  function triggerObservers(item: T): void {
    const status = getStatus(item);
    observers.get(item)?.forEach(observer => observer(status));
  }

  function observeStatus(
    item: T,
    observer: Observer<DependencyStatus>,
  ): Unobserver {
    mapSetAdd(observers, item, observer);

    return () => mapSetDelete(observers, item, observer);
  }

  function addDependency(item: T, dependency: T): void {
    mapSetAdd(edges, item, dependency);
    mapSetAdd(inverseEdges, dependency, item);
  }

  function removeDependencies(item: T): void {
    edges.get(item)?.forEach(dep => mapSetDelete(inverseEdges, dep, item));
    mapSetDelete(edges, item);
  }

  return {
    getStatus,
    markStatus,
    observeStatus,
    addDependency,
    removeDependencies,
  };
}
