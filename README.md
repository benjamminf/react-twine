# react-twine

## Creating state

```jsx
const counterState = createState(0);

function Counter() {
  const [count, setCounter] = useSharedState(counterState);
  const increment = () => setCounter(count + 1);

  return <button onClick={increment}>{count}</button>;
}
```

## Creating selectors

```jsx
const counterState = createState(0);
const counterDoubleSelector = createSelector(get => get(counterState) * 2);

function Counter() {
  const [count, setCounter] = useSharedState(counterState);
  const countDouble = useSelector(counterDoubleSelector);
  const increment = () => setCounter(count + 1);

  return (
    <p>
      <button onClick={increment}>{count}</button> * 2 = {countDouble}
    </p>
  );
}
```

## Deriving state

```jsx
const counterState = createState(0);
const counterDoubleState = deriveState(
  get => get(counterState) * 2,
  (value, set) => set(counterState, value / 2)
);

function Counter() {
  const [count, setCounter] = useSharedState(counterState);
  const [countDouble, setCounterDouble] = useSharedState(counterDoubleState);
  const increment = () => setCounter(count + 1);
  const incrementDouble = () => setCounterDouble(countDouble + 1);

  return (
    <p>
      <button onClick={increment}>{count}</button> * 2 =
      <button onClick={incrementDouble}>{countDouble}</button>
    </p>
  );
}
```

## Creating state maps

```jsx
const mouseState = createStateMap({x: 0, y: 0});

window.addEventListener('mousemove', event => {
  mouseState.set({x: event.offsetX, y: event.offsetY});
});

function MouseCoordinates() {
  const mouseX = useSelector(mouseState.x);
  const mouseY = useSelector(mouseState.y);

  return (
    <p>
      ({mouseX}, {mouseY})
    </p>
  );
}
```

## Creating state factories

```jsx
const itemStates = createStateFactory(key => `Item ${key}`);

function Item(props) {
  const item = useSelector(itemStates(props.itemKey));

  return <p>This item: {item}</p>;
}
```

## Defaulting state asynchronously

```jsx
const counterState = createState(async () => {
  await delay(1000);
  return 0;
});

function Counter() {
  const [count, setCounter] = useAsyncState(counterState);
  const increment = () => setCounter(count => count + 1);

  return <button onClick={increment}>{count ?? 'loading...'}</button>;
}
```

## Selecting asynchronously

```jsx
const counterState = createState(0);
const counterDoubleSelector = createSelector(async ({get}) => {
  const counter = get(counterState);
  await delay(1000);
  return counter * 2;
});

function Counter() {
  const [count, setCounter] = useSharedState(counterState);
  const [countDouble] = useAsyncSelector(counterDoubleSelector);
  const increment = () => setCounter(count + 1);

  return (
    <p>
      <button onClick={increment}>{count}</button> * 2 =
      {countDouble ?? 'loading...'}
    </p>
  );
}
```
