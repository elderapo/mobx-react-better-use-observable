import { getAtom, IValueDidChange, observe } from "mobx";
import DeepProxyType from "proxy-deep";
import { isAtom } from "./helperFunctions";

const DeepProxy = require("proxy-deep") as typeof DeepProxyType;

export enum MobxProxyEvent {
  RegisterSubscription = "register-subscription",
  Write = "write"
}

export type MobxProxyEventHandlers = {
  [MobxProxyEvent.RegisterSubscription]: (item: TrackDataItem) => void;
  [MobxProxyEvent.Write]: (change: IValueDidChange<any>) => void;
};

type RegistedHandlers = Map<MobxProxyEvent, MobxProxyEventHandlers[MobxProxyEvent][]>;

type TrackDataItem = { target: any; key: any };

export type RemoveHandlerFN = () => void;

export class MobxProxy<T extends object> {
  public readonly value: T;
  private registeredHandlers: RegistedHandlers = new Map();

  private trackedData = new Map<object, (string | number | symbol)[]>();
  private observeCleaners: (() => void)[] = [];

  constructor(private target: T) {
    const that = this;

    this.value = new DeepProxy(this.target, {
      get(target: any, key: keyof typeof target, receiver: any) {
        // that.trackData({ target: wtf, key });
        // return target[key];

        const result = target[key];

        that.trackData({ target, key });

        if (typeof result === "object" && result !== null) {
          return this.nest(result);
        }

        return result;
      }
    });
  }

  public on<E extends MobxProxyEvent, H extends MobxProxyEventHandlers[E]>(
    event: E,
    handler: H
  ): RemoveHandlerFN {
    if (!this.registeredHandlers.has(event)) {
      this.registeredHandlers.set(event, []);
    }

    const thisEventHandlers = this.registeredHandlers.get(event)!;

    thisEventHandlers.push(handler);

    return () => {
      const index = thisEventHandlers.indexOf(handler);

      if (index === -1) {
        return;
      }

      thisEventHandlers.splice(index, 1);
    };
  }

  public reset(): void {
    this.trackedData = new Map();
    this.observeCleaners.forEach(fn => fn());
  }

  private trackData(item: TrackDataItem): void {
    try {
      getAtom(item.target);
    } catch (ex) {
      if (ex.message.includes("[mobx] Cannot obtain atom")) {
        return;
      }
    }

    if (!isAtom(item.target, item.key)) {
      return;
    }

    if (!this.trackedData.has(item.target)) {
      this.trackedData.set(item.target, []);
    }

    if (this.trackedData.get(item.target)!.includes(item.key)) {
      return;
    }

    const clean = observe(item.target, item.key, change => {
      this.callHandlers(MobxProxyEvent.Write, [change]);
    });

    this.observeCleaners.push(clean);
    this.trackedData.get(item.target)!.push(item.key);

    this.callHandlers(MobxProxyEvent.RegisterSubscription, [item]);
  }

  private callHandlers<E extends MobxProxyEvent, H extends MobxProxyEventHandlers[E]>(
    event: E,
    args: Parameters<H>
  ): void {
    if (!this.registeredHandlers.has(event)) {
      return;
    }

    this.registeredHandlers.get(event)!.forEach(fn => {
      (fn as any)(...args);
    });
  }
}
