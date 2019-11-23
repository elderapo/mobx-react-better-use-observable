import { action, observable } from "mobx";

export class CounterStore {
  @observable
  public count: number = 100;

  @action.bound
  public increment(): void {
    this.count++;
  }

  @action.bound
  public decrement(): void {
    this.count--;
  }
}
