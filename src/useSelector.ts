import {Selector} from './types';
import {useEffect, useState} from 'react';

export default function useSelector<T>(sharedSelector: Selector<T>): T {
  const value = sharedSelector.get();
  const [, setObserveCounter] = useState(0);

  useEffect(
    () => sharedSelector.observe(() => setObserveCounter(count => count + 1)),
    [sharedSelector]
  );

  return value;
}
