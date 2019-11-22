import { CounterStore } from "./CounterStore";

export class StoreWithNestedCounter {
  public a = {
    b: {
      c: new CounterStore()
    }
  };
}
