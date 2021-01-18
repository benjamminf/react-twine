import {DependencyList, useEffect, useState} from 'react';

export type AsyncState<T> = {
  value?: T;
  error?: Error;
  complete?: boolean;
};

function asError(error: unknown): Error {
  return error instanceof Error
    ? error
    : new Error(error != null ? String(error) : undefined);
}

export default function useAsync<T>(
  fn: () => Promise<T>,
  deps: DependencyList = []
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({complete: false});

  useEffect(() => {
    let cancelled = false;

    setState({complete: false});
    fn().then(
      value => !cancelled && setState({value, complete: true}),
      reason => !cancelled && setState({error: asError(reason), complete: true})
    );

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}
