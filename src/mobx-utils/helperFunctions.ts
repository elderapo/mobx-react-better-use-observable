import DeepProxyType from "proxy-deep";
import { getAtom } from "mobx";

export const DeepProxy = require("proxy-deep") as typeof DeepProxyType;

export const isAtom = (item: any, key: string): boolean => {
  try {
    const atom = getAtom(item, key);
    return !!atom;
  } catch (ex) {
    return false;
  }
};
