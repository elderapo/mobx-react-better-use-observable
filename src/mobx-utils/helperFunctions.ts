import { getAtom } from "mobx";

export const isAtom = (item: any, key: string): boolean => {
  try {
    const atom = getAtom(item, key);
    return !!atom;
  } catch (ex) {
    return false;
  }
};
