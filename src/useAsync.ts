import {DependencyList, useEffect, useState} from 'react';

export type AsyncState<T> = {
  value?: T;
  error?: Error;
  complete?: boolean;
};

export default function useAsync<T>(
  fn: () => Promise<T>,
  deps: DependencyList = []
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({complete: false});

  useEffect(() => {
    let cancelled = false;
    fn().then(value => !cancelled && setState({value, complete: true}));
    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}
