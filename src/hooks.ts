import { Selector } from './types';
import { DependencyList, useEffect, useState } from 'react';

export function useValue<T>(selector: Selector<T>): T {
  const value = selector.get();
  const [, setObserveCounter] = useState(0);

  useEffect(
    () => selector.observe(() => setObserveCounter(count => count + 1)),
    [selector],
  );

  return value;
}

export function useObserved() {
  function get() {}

  function dispatch() {}

  return { get, dispatch };
}

// TODO useValues()

type AsyncState<T> = {
  value?: T;
  error?: Error;
  complete?: boolean;
};

function asError(error: unknown): Error {
  return error instanceof Error
    ? error
    : new Error(error != null ? String(error) : undefined);
}

function useAsync<T>(
  fn: () => Promise<T>,
  deps: DependencyList = [],
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ complete: false });

  useEffect(() => {
    let cancelled = false;

    setState({ complete: false });
    fn().then(
      value => !cancelled && setState({ value, complete: true }),
      reason =>
        !cancelled && setState({ error: asError(reason), complete: true }),
    );

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}

export function useAsyncValue<T>(
  selector: Selector<Promise<T>>,
): [T | undefined, Error | undefined] {
  const promise = useValue(selector);
  const { value, error } = useAsync(() => promise, [promise]);

  return [value, error];
}
