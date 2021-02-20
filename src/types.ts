export type InitialValue<T> = T | (() => T);

export type GetValue<T> = T;
export type GetMethod<T> = () => GetValue<T>;
export type GetFunction = <T>(selector: Selector<T>) => GetValue<T>;

export type SetValue<T> = T | ((value: T) => T);
export type SetMethod<T> = (value: SetValue<T>) => void;
export type SetFunction = <T>(state: State<T>, value: SetValue<T>) => void;

export type DispatchMethod<T> = (value: T) => void;
export type DispatchFunction = <T>(action: Action<T>, value: T) => void;

export type Observer<T> = (value: T, oldValue: T) => void;
export type Unobserver = () => void;
export type Observers<T> = Set<Observer<T>>;
export type ObserveMethod<T> = (observer: Observer<T>) => Unobserver;

export type StatesMethod = () => Set<State<any>>;

export type Getter<T> = (context: {get: GetFunction}) => GetValue<T>;
export type Setter<T> = (context: {
  value: T;
  set: SetFunction;
  get: GetFunction;
  dispatch: DispatchFunction;
}) => void;

export type Selector<T> = {
  get: GetMethod<T>;
  observe: ObserveMethod<T>;
};

export type State<T> = Selector<T> & {
  set: SetMethod<T>;
};

export type Action<T> = {
  dispatch: DispatchMethod<T>;
};

export type FactoryFunction<K, V> = (key: K) => V;
export type FactoryProperties<K> = {keys: Selector<Set<K>>};

export type Factory<K, V> = FactoryFunction<K, V> &
  FactoryProperties<K> &
  State<Map<K, V>>;

export type SelectorFactory<K, V> = FactoryFunction<K, Selector<V>> &
  FactoryProperties<K> &
  Selector<Map<K, V>>;

export type StateFactory<K, V> = FactoryFunction<K, State<V>> &
  FactoryProperties<K> &
  State<Map<K, V>>;

export type ValueRange<V> = Iterable<V> | ((value: V) => boolean);
