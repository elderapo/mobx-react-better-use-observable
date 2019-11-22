import { observable } from "mobx";
import { MobxProxy, MobxProxyEvent } from "../mobx-utils";
import { StoreWithNestedCounter } from "../stores";

describe("mobx-utils", () => {
  describe("MobxProxy", () => {
    it("access of proxied value property should trigger subscription registration", async () => {
      const state = observable({
        count: 100
      });

      const proxy = new MobxProxy(state);

      const onRegisterSubscriptionHandler = jest.fn();

      proxy.on(
        MobxProxyEvent.RegisterSubscription,
        onRegisterSubscriptionHandler
      );

      expect(onRegisterSubscriptionHandler).not.toBeCalled();

      proxy.value.count;

      expect(onRegisterSubscriptionHandler).toBeCalled();
    });

    it("access of original value property should not trigger subscription registration", async () => {
      const state = observable({
        count: 100
      });

      const proxy = new MobxProxy(state);

      const onRegisterSubscriptionHandler = jest.fn();

      proxy.on(
        MobxProxyEvent.RegisterSubscription,
        onRegisterSubscriptionHandler
      );

      expect(onRegisterSubscriptionHandler).not.toBeCalled();

      state.count;

      expect(onRegisterSubscriptionHandler).not.toBeCalled();
    });

    it("update of proxied value property should trigger write", () => {
      const state = observable({
        count: 100
      });

      const proxy = new MobxProxy(state);

      const onWriteHandler = jest.fn();

      proxy.on(MobxProxyEvent.Write, onWriteHandler);

      expect(onWriteHandler).not.toBeCalled();

      proxy.value.count;

      expect(onWriteHandler).not.toBeCalled();

      proxy.value.count = 101;

      expect(onWriteHandler).toBeCalled();
    });

    it("multiple updates of proxied value property should trigger multiple writes", () => {
      const state = observable({
        count: 100
      });

      const proxy = new MobxProxy(state);

      const onWriteHandler = jest.fn();

      proxy.on(MobxProxyEvent.Write, onWriteHandler);

      expect(onWriteHandler).not.toBeCalled();

      proxy.value.count;

      expect(onWriteHandler).not.toBeCalled();

      proxy.value.count = 101;
      proxy.value.count = 102;
      proxy.value.count = 103;

      expect(onWriteHandler).toBeCalledTimes(3);
    });

    it("update of original value property should trigger write", () => {
      const state = observable({
        count: 100
      });

      const proxy = new MobxProxy(state);

      const onWriteHandler = jest.fn();

      proxy.on(MobxProxyEvent.Write, onWriteHandler);

      expect(onWriteHandler).not.toBeCalled();

      proxy.value.count;

      expect(onWriteHandler).not.toBeCalled();

      state.count = 101;

      expect(onWriteHandler).toBeCalled();
    });

    it("multiple updates of original value property should trigger multiple writes", () => {
      const state = observable({
        count: 100
      });

      const proxy = new MobxProxy(state);

      const onWriteHandler = jest.fn();

      proxy.on(MobxProxyEvent.Write, onWriteHandler);

      expect(onWriteHandler).not.toBeCalled();

      proxy.value.count;

      expect(onWriteHandler).not.toBeCalled();

      state.count = 101;
      proxy.value.count = 102;
      proxy.value.count = 103;

      expect(onWriteHandler).toBeCalledTimes(3);
    });

    it("should not trigger write for proxied value if it wasn't accesssed before", () => {
      const state = observable({
        count: 100
      });

      const proxy = new MobxProxy(state);

      const onWriteHandler = jest.fn();

      proxy.on(MobxProxyEvent.Write, onWriteHandler);

      expect(onWriteHandler).not.toBeCalled();

      state.count = 101;
      proxy.value.count = 102;
      proxy.value.count = 103;

      expect(onWriteHandler).not.toBeCalled();
    });

    it("should work with nested structures that not only consist of observables", () => {
      const store = new StoreWithNestedCounter();

      const proxy = new MobxProxy(store);

      const onRegisterSubscriptionHandler = jest.fn();
      const onWriteHandler = jest.fn();

      proxy.on(
        MobxProxyEvent.RegisterSubscription,
        onRegisterSubscriptionHandler
      );
      proxy.on(MobxProxyEvent.Write, onWriteHandler);

      expect(onRegisterSubscriptionHandler).not.toBeCalled();
      expect(onWriteHandler).not.toBeCalled();

      proxy.value.a.b.c.count;

      expect(onRegisterSubscriptionHandler).toBeCalled();
      expect(onWriteHandler).not.toBeCalled();

      proxy.value.a.b.c.increment();
      store.a.b.c.increment();

      expect(onRegisterSubscriptionHandler).toBeCalled();
      expect(onWriteHandler).toBeCalledTimes(2);
    });

    it("reset should reset all previous subscriptions so further updates won't trigger writes", () => {
      const state = observable({
        count: 100
      });

      const proxy = new MobxProxy(state);

      const onRegisterSubscriptionHandler = jest.fn();
      const onWriteHandler = jest.fn();

      proxy.on(
        MobxProxyEvent.RegisterSubscription,
        onRegisterSubscriptionHandler
      );
      proxy.on(MobxProxyEvent.Write, onWriteHandler);

      expect(onRegisterSubscriptionHandler).not.toBeCalled();
      expect(onWriteHandler).not.toBeCalled();

      proxy.value.count;

      expect(onRegisterSubscriptionHandler).toBeCalled();
      expect(onWriteHandler).not.toBeCalled();

      proxy.value.count = 101;
      state.count = 102;

      expect(onWriteHandler).toBeCalledTimes(2);

      proxy.reset();

      proxy.value.count = 103;
      state.count = 104;

      expect(onWriteHandler).toBeCalledTimes(2);
    });
  });
});
