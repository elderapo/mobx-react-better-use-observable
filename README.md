# mobx-react-better-use-observable

### How to install

```bash
yarn add mobx-react-better-use-observable
# or
npm install mobx-react-better-use-observable
```

### Example:

```tsx
import { observable, action } from "mobx";
import { useObservable } from "mobx-react-better-use-observable";
import * as React from "react";

class CounterStore {
  @observable
  public count: number = 100;

  @action.bound
  public increment(): void {
    this.count++;
  }
}

const store = new CounterStore();

const CounterDisplayerWithoutHOF = () => {
  const { count, increment } = useObservable(store);

  return (
    <div>
      <h2>Counter(without observer): {count}</h2>
      <button onClick={increment}>increment</button>
    </div>
  );
};
```
