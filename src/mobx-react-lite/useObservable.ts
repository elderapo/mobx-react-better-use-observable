import { useEffect, useMemo } from "react";
import useForceUpdate from "use-force-update";
import { MobxProxy, MobxProxyEvent } from "../mobx-utils";

export const useObservable = <T extends object>(store: T): T => {
  const forceUpdate = useForceUpdate();

  const proxy = useMemo(() => {
    return new MobxProxy(store);
  }, [store]);

  useEffect(() => {
    const removeEventListener = proxy.on(MobxProxyEvent.Write, () => {
      forceUpdate();
    });

    return () => {
      proxy.reset();
      removeEventListener();
    };
  });

  return proxy.value;
};
