import {Observable} from './types';
import {useEffect, useState} from 'react';

export default function useValue<T>(observable: Observable<T>): T {
  const value = observable.get();
  const [, setObserveCounter] = useState(0);

  useEffect(
    () => observable.observe(() => setObserveCounter(count => count + 1)),
    [observable]
  );

  return value;
}
