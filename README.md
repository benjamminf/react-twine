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
  useSharedSelector,
} from 'react-twine';

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
import {createStateMap, useSharedSelector} from 'react-twine';

const mouseState = createStateMap({x: 0, y: 0});

window.addEventListener('mousemove', event => {
  mouseState.set({x: event.offsetX, y: event.offsetY});
});

function MouseCoordinates() {
  const mouseX = useSharedSelector(mouseState.x);
  const mouseY = useSharedSelector(mouseState.y);
  // Or:
  // const {x: mouseX, y: mouseY} = useSharedSelector(mouseState);

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
import {createState, stateFactory, useSharedSelector} from 'react-twine';

const itemStateFactory = stateFactory(key => createState(`Item ${key}`));

function Item(props) {
  const item = useSharedSelector(itemStateFactory(props.itemKey));

  return <p>This item: {item}</p>;
}
```

## Defaulting state asynchronously

```jsx
import React from 'react';
import {createState, useAsyncSharedState} from 'react-twine';
import delay from 'delay';

const counterState = createState(async () => {
  await delay(1000);
  return 0;
});

function Counter() {
  const [count, setCounter] = useAsyncSharedState(counterState);
  const increment = () => count != null && setCounter(count + 1);
  // Or:
  // const [countPromise, setCounterPromise] = useSharedState(counterState);
  // const {value: count} = useAsync(() => countPromise, [countPromise]);
  // const increment = () => count != null && setCounterPromise(Promise.resolve(count + 1));

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
  useAsyncSharedSelector,
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

  const [countDouble] = useAsyncSharedSelector(counterDoubleSelector);
  // Or:
  // const countDoublePromise = useSharedSelector(counterDoubleSelector);
  // const {value: countDouble} = useAsync(() => countDoublePromise, [countDoublePromise]);

  return (
    <p>
      <button onClick={increment}>{count}</button> * 2 =
      {countDouble ?? 'loading...'}
    </p>
  );
}
```
