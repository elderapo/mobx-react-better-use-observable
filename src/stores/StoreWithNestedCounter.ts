import { CounterStore } from "./CounterStore";

export class StoreWithNestedCounter {
  public a = {
    b: {
      c: {
        counterStore: new CounterStore()
      }
    }
  };
}
