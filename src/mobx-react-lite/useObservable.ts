import { useEffect, useMemo } from "react";
import useForceUpdate from "use-force-update";
import { MobxProxy, MobxProxyEvent } from "../mobx-utils";

export const useObservable = <T extends object>(store: T): T => {
  const forceUpdate = useForceUpdate();

  const proxy = useMemo(() => {
    return new MobxProxy(store);
  }, [store]);

  proxy.reset(); // discard old subscriptions
  const removeEventListener = proxy.on(MobxProxyEvent.Write, () => {
    forceUpdate();
  });

  useEffect(() => {
    proxy.dontRegisterNewSubscriptions();

    return () => removeEventListener();
  }, [removeEventListener]);

  return proxy.value;
};
