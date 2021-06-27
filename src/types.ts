export type InitialValue<T> = T | (() => T);

export type GetValue<T> = T;

export type SetValue<T> = T | ((value: T) => T);

export type Observer<T> = (value: T, oldValue?: T) => void;
export type Unobserver = () => void;

export type Cleanup = () => void;
export type Effect = () => Cleanup | void;
export type Uneffect = () => void;

export type GetterContext = {
  get<V>(selector: Selector<V>): GetValue<V>;
};

export type Getter<T> = (context: GetterContext) => GetValue<T>;

export type SetterContext = GetterContext & {
  set<V>(state: State<V>, value: SetValue<V>): void;
  dispatch<V>(action: Action<V>, value: V): void;
};

export type Setter<T> = (context: SetterContext, value: T) => void;

export type Selector<T> = {
  readonly key: symbol;
  get(): GetValue<T>;
  observe(observer: Observer<T>, passive?: boolean): Unobserver;
  effect(effect: Effect): Uneffect;
};

export type SelectorCreator = <T>(getter: Getter<T>) => Selector<T>;

export type State<T> = Selector<T> & {
  set(value: SetValue<T>): void;
};

export type StateCreator = <T>(initialValue: InitialValue<T>) => State<T>;

export type ProxyStateCreator = <T>(
  getter: Getter<T>,
  setter: Setter<T>,
) => State<T>;

export type Action<T> = {
  dispatch(value: T): void;
};

export type ActionCreator = <T = void>(setter: Setter<T>) => Action<T>;

export type ValueRange<V> = Set<V> | ((value: V) => boolean);

export type Box<V> = [V];

export type Factory<K, V> = (key: K) => V;

export interface Transactor {
  transact(operation: () => void): void;
  finalize(operation: () => void): void;
  isTransacting(): boolean;
}

export enum DependencyStatus {
  Unchanged,
  Changing,
  Changed,
  Stale,
}

export interface DependencyStore<T> {
  status(item: T): DependencyStatus | undefined;
  mark(item: T, status: DependencyStatus): void;
  link(item: T, dependency: T): void;
  unlink(item: T, dependency?: T): void;
  observe(item: T, observer: Observer<DependencyStatus>): Unobserver;
}
