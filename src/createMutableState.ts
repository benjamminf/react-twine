import bucket from './bucket';
import createState, {
  InitialValue,
  Observer,
  SetValue,
  State,
  Unobserve,
} from './createState';

export default function createMutableState<T>(
  initialValue: InitialValue<T>
): State<T> {
  const proxyState = createState(() =>
    bucket(initialValue instanceof Function ? initialValue() : initialValue)
  );
  const {observers} = proxyState.observe;

  function get(): T {
    return proxyState.get().value;
  }

  function set(value: SetValue<T>): void {
    proxyState.set(bucket(value instanceof Function ? value(get()) : value));
  }

  function observe(observer: Observer<T>): Unobserve {
    return proxyState.observe(({value}, {value: oldValue}) => {
      observer(value, oldValue);
    });
  }

  return {
    get,
    set,
    observe: Object.assign(observe, {observers}),
  };
}
