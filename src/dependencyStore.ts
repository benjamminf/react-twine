import { Observer, Unobserver } from './types';

export enum DependencyStatus {
  Stale = 'Stale',
  Fresh = 'Fresh',
}

export interface DependencyStore<T> {
  getStatus(item: T): DependencyStatus;
  markStatus(item: T, status: DependencyStatus): void;
  addDependency(item: T, dependency: T): void;
  removeDependency(item: T, dependency: T): void;
  removeDependencies(item: T): void;
  observeStatus(item: T, observer: Observer<DependencyStatus>): Unobserver;
}

export function createDependencyStore<T>(): DependencyStore<T> {
  const statuses = new Map<T, DependencyStatus>(); // TODO weakmap
  const edges = new Map<T, Set<T>>(); // TODO weakmap
  const inverseEdges = new Map<T, Set<T>>(); // TODO weakmap
  const observers = new Map<T, Set<Observer<DependencyStatus>>>(); // TODO weakmap

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

      return true;
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

  function removeDependency(item: T, dependency: T): void {
    mapSetDelete(edges, item, dependency);
    mapSetDelete(inverseEdges, dependency, item);
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
    removeDependency,
    removeDependencies, // TODO is this needed?
  };
}

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
  edges: Map<T, Set<T>>,
  root: T,
  callback: (item: T) => boolean,
): void {
  const rootDependents = edges.get(root);

  if (!rootDependents) {
    return;
  }

  const pool = [...rootDependents];
  const visited = new Set([root]);

  while (pool.length > 0) {
    const item = pool.pop()!;

    if (visited.has(item)) {
      continue;
    }

    visited.add(item);

    if (callback(item)) {
      const dependents = edges.get(item);
      if (dependents) {
        pool.push(...dependents);
      }
    }
  }
}
