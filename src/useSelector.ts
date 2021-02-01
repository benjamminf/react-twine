import {useEffect, useState} from 'react';
import {Selector} from './createSelector';

export default function useSharedSelector<T>(sharedSelector: Selector<T>): T {
  const value = sharedSelector.get();
  const [, setObserveCounter] = useState(0);

  useEffect(
    () => sharedSelector.observe(() => setObserveCounter(count => count + 1)),
    [sharedSelector]
  );

  return value;
}
