import {Selector} from './types';
import {useEffect, useState} from 'react';

export default function useValue<T>(selector: Selector<T>): T {
  const value = selector.get();
  const [, setObserveCounter] = useState(0);

  useEffect(
    () => selector.observe(() => setObserveCounter(count => count + 1)),
    [selector]
  );

  return value;
}
