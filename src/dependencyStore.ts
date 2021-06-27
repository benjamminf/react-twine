import {
  DependencyStatus,
  DependencyStore,
  Observer,
  Unobserver,
} from './types';

export function createDependencyStore<T>(): DependencyStore<T> {
  function status(item: T): DependencyStatus | undefined {
    return undefined;
  }

  function mark(item: T, status: DependencyStatus): void {}

  function link(item: T, dependency: T): void {}

  function unlink(item: T, dependency?: T): void {}

  function observe(item: T, observer: Observer<DependencyStatus>): Unobserver {
    return () => {};
  }

  return {
    status,
    mark,
    link,
    unlink,
    observe,
  };
}
