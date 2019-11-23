import { storiesOf } from "@storybook/react";
import * as React from "react";
import { useObservable } from "../mobx-react-lite";
import { CounterStore, StoreWithNestedCounter } from "../stores";
import useInterval from "@use-it/interval";
import { useState, useRef, useEffect, useCallback } from "@storybook/addons";

const stories = storiesOf("useObservable", module);

const counterStore = new CounterStore();

stories.add(
  "Simple",
  () => {
    const observedStore = useObservable(counterStore);

    return (
      <div>
        <h3>Counter: {observedStore.count}</h3>
        <button onClick={observedStore.increment}>increment</button>
        <button onClick={observedStore.decrement}>decrement</button>
      </div>
    );
  },
  {
    notes: {
      markdown: `This is simple increment/decrement count example. Nothing fancy here.`
    }
  }
);

const storeWithNestedCounter = new StoreWithNestedCounter();

stories.add(
  "Nested store",
  () => {
    const observedStore = useObservable(storeWithNestedCounter);

    return (
      <div>
        <h3>Counter: {observedStore.a.b.c.counterStore.count}</h3>
        <button onClick={observedStore.a.b.c.counterStore.increment}>increment</button>
        <button onClick={observedStore.a.b.c.counterStore.decrement}>decrement</button>
      </div>
    );
  },
  {
    notes: {
      markdown: `
This example showcases that \`useObservable\` works well with nested observables. \`storeWithNestedCounter\` itself is not an observable and doesn't contain any direct observables. It however has instance of \`CounterStore\` deep down in the tree (\`observedStore.a.b.c.counterStore\`).

In daily MobX usage it's common to see the concept of \`RootStore\`. It's purpose is to hold instances of other stores and connect them with each other. \`useObservable\` is just perfect for it.
`
    }
  }
);

const autoUpdatableCounterStore = new CounterStore();

stories.add(
  "Conditional observable subscription",
  () => {
    const [isSubscribedToCount, setIsSubscribedToCount] = useState(false);

    const [intervalRate, setIntervalRate] = useState(100);
    const renderIdRef = useRef(0);
    renderIdRef.current++;

    const observedStore = useObservable(autoUpdatableCounterStore);

    useInterval(() => {
      observedStore.increment();
      console.log(`Current count value: ${observedStore.count}!`);
    }, intervalRate);

    const onCheckCurrentCountValueCallback = useCallback(() => {
      alert(`Current count value: ${observedStore.count}!`);
    }, []);

    return (
      <div>
        <h3 style={{ opacity: isSubscribedToCount ? 1 : 0.5 }}>
          Counter: {isSubscribedToCount ? observedStore.count : "not subscribed"}
        </h3>
        <h3>Component rendered {renderIdRef.current} times!</h3>
        <div>
          <span>Increment every</span>
          <input
            style={{ margin: "0 10px" }}
            size={1}
            type="number"
            value={intervalRate}
            onChange={e => {
              const parsed = parseInt(e.target.value, 10);

              if (Number.isNaN(parsed)) {
                return;
              }

              setIntervalRate(parsed);
            }}
          />
          <span>miliseconds</span>
        </div>
        <div>
          <span>Listen to counter updates:</span>
          <input
            type="checkbox"
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              marginLeft: 5
            }}
            checked={isSubscribedToCount}
            onChange={e => setIsSubscribedToCount(e.target.checked)}
          />
        </div>
        <button onClick={onCheckCurrentCountValueCallback}>Check current count value...</button>
      </div>
    );
  },
  {
    notes: {
      markdown: `
This example showcases that component gets rerendered only when \`observable\` gets accessed during \`rendering\` phase. Access from \`useInterval\` callback, button \`onClick\` callback or following ternary operator \`isSubscribedToCount ? observedStore.count : "not subscribed"\` (when \`isSubscribedToCount\` is \`false\`) do not trigger an update!
`
    }
  }
);

stories.add("empty", () => {
  return <div>empty</div>;
});
