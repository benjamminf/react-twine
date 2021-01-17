import {useEffect, useState} from 'react';
import {Selector} from './createSelector';

export default function useSharedSelector<T>(sharedSelector: Selector<T>): T {
  const value = sharedSelector.get();
  const [, forceUpdate] = useState(value);

  useEffect(() => sharedSelector.observe(forceUpdate), [sharedSelector]);

  return value;
}
