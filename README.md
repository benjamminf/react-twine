# react-sharestate

## Creating state

```jsx
import {createState, useSharedState} from 'react-sharestate';

const counterState = createState(0);

function Counter() {
  const [count, setCounter] = useSharedState(counterState);
  const increment = () => setCounter(count + 1);

  return <button onClick={increment}>{count}</button>;
}
```

## Creating selectors

```jsx
import {
  createState,
  createSelector,
  useSharedState,
  useSharedSelector,
} from 'react-sharestate';

const counterState = createState(0);
const counterDoubleSelector = createSelector(({get}) => get(counterState) * 2);

function Counter() {
  const [count, setCounter] = useSharedState(counterState);
  const countDouble = useSharedSelector(counterDoubleSelector);
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
import {createState, deriveState, useSharedState} from 'react-sharestate';

const counterState = createState(0);
const counterDoubleState = deriveState(
  ({get}) => get(counterState) * 2,
  (value, {set}) => set(value / 2)
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
import {createStateMap, useSharedSelector} from 'react-sharestate';

const mouseState = createStateMap({x: 0, y: 0});

window.addEventListener('mousemove', event => {
  mouseState.set({x: event.offsetX, y: event.offsetY});
});

function MouseCoordinates() {
  const mouseX = useSharedSelector(mouseState.x);
  const mouseY = useSharedSelector(mouseState.y);
  // Or: const {x: mouseX, y: mouseY} = useSharedSelector(mouseState);

  return (
    <p>
      ({mouseX}, {mouseY})
    </p>
  );
}
```

## Creating state factories

```jsx
import {createState, memo, useSharedSelector} from 'react-sharestate';

const itemStateFactory = memo(key => createState(`Item ${key}`));

function Item(props) {
  const item = useSharedSelector(itemStateFactory(props.itemKey));

  return <p>This item: {item}</p>;
}
```

## Defaulting state asynchronously

```jsx
import {createState, memo} from 'react-sharestate';

const asyncState = memo(() => {
  const state = createState('loading');
  const timeout = setTimeout(() => state.set('loaded'), 1000);

  state.observe(() => clearTimeout(timeout));

  return state;
});
```

## Selecting asynchronously

```jsx
import {createState, createSelector, memo} from 'react-sharestate';

const counterState = createState(0);
const counterDoubleState = createState(0);

counterState.observe(count => {
  setTimeout(() => counterDoubleState.set(count * 2), 1000);
});
```
