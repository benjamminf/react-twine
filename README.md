# react-twine

## Creating state

```jsx
import React from 'react';
import {createState, useSharedState} from 'react-twine';

const counterState = createState(0);

function Counter() {
  const [count, setCounter] = useSharedState(counterState);
  const increment = () => setCounter(count + 1);

  return <button onClick={increment}>{count}</button>;
}
```

## Creating selectors

```jsx
import React from 'react';
import {
  createState,
  createSelector,
  useSharedState,
  useSelector,
} from 'react-twine';

const counterState = createState(0);
const counterDoubleSelector = createSelector(({get}) => get(counterState) * 2);

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
import React from 'react';
import {createState, deriveState, useSharedState} from 'react-twine';

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
import React from 'react';
import {createStateMap, useSelector} from 'react-twine';

const mouseState = createStateMap({x: 0, y: 0});

window.addEventListener('mousemove', event => {
  mouseState.set({x: event.offsetX, y: event.offsetY});
});

function MouseCoordinates() {
  const mouseX = useSelector(mouseState.x);
  const mouseY = useSelector(mouseState.y);
  // Or:
  // const {x: mouseX, y: mouseY} = useSelector(mouseState);

  return (
    <p>
      ({mouseX}, {mouseY})
    </p>
  );
}
```

## Creating state factories

```jsx
import React from 'react';
import {createState, stateFactory, useSelector} from 'react-twine';

const itemStateFactory = stateFactory(key => createState(`Item ${key}`));

function Item(props) {
  const item = useSelector(itemStateFactory(props.itemKey));

  return <p>This item: {item}</p>;
}
```

## Defaulting state asynchronously

```jsx
import React from 'react';
import {createState, useAsyncState} from 'react-twine';
import delay from 'delay';

const counterState = createState(async () => {
  await delay(1000);
  return 0;
});

function Counter() {
  const [count, setCounter] = useAsyncState(counterState);
  const increment = () => setCounter(count => count + 1);
  // Or:
  // const [countPromise, setCounterPromise] = useSharedState(counterState);
  // const {value: count} = useAsync(() => countPromise, [countPromise]);
  // const increment = () => setCounterPromise(promise => promise.then(count => count + 1));

  return <button onClick={increment}>{count ?? 'loading...'}</button>;
}
```

## Selecting asynchronously

```jsx
import React from 'react';
import {
  createState,
  createSelector,
  useSharedState,
  useAsyncSelector,
} from 'react-twine';
import delay from 'delay';

const counterState = createState(0);
const counterDoubleSelector = createSelector(async ({get}) => {
  const counter = get(counterState);
  await delay(1000);
  return counter * 2;
});

function Counter() {
  const [count, setCounter] = useSharedState(counterState);
  const increment = () => setCounter(count + 1);

  const [countDouble] = useAsyncSelector(counterDoubleSelector);
  // Or:
  // const countDoublePromise = useSelector(counterDoubleSelector);
  // const {value: countDouble} = useAsync(() => countDoublePromise, [countDoublePromise]);

  return (
    <p>
      <button onClick={increment}>{count}</button> * 2 =
      {countDouble ?? 'loading...'}
    </p>
  );
}
```
