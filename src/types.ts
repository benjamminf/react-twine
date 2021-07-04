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

export type SetterContext = GetterContext & {
  set<V>(state: State<V>, value: SetValue<V>): void;
  dispatch<V>(action: Action<V>, value: V): void;
};

export type Getter<T> = (context: GetterContext) => GetValue<T>;
export type Setter<T> = (context: SetterContext, value: T) => void;

export type Selector<T> = {
  readonly key: symbol;
  get(): GetValue<T>;
  observe(observer: Observer<T>, passive?: boolean): Unobserver;
  effect(effect: Effect): Uneffect;
};

export type Action<T> = {
  dispatch(value: T): void;
};

export type State<T> = Selector<T> & {
  set(value: SetValue<T>): void;
};
