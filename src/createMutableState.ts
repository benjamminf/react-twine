import {InitialValue, Observer, SetValue, State, Unobserver} from './types';
import createState from './createState';
import bucket from './bucket';
import resolveValue from './resolveValue';

export default function createMutableState<T>(
  initialValue: InitialValue<T>
): State<T> {
  const proxyState = createState(() => bucket(resolveValue(initialValue)));

  function get(): T {
    return proxyState.get().value;
  }

  function set(value: SetValue<T>): void {
    proxyState.set(bucket(resolveValue(value, get)));
  }

  function observe(observer: Observer<T>): Unobserver {
    return proxyState.observe(({value}, {value: oldValue}) => {
      observer(value, oldValue);
    });
  }

  return {
    get,
    set,
    observe,
  };
}
