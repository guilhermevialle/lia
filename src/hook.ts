import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";

import { LiaProvider } from "./provider";
import { Callback, Id } from "./types";

export function useLiaQuery(provider: LiaProvider) {
  const version = useRef(0);

  const subscribe = useCallback(
    (cb: Callback) =>
      provider.subscribe(() => {
        version.current++;
        cb();
      }),
    [provider],
  );

  const current = useSyncExternalStore(subscribe, () => version.current);

  return useMemo(
    () => ({
      isElementActive: (id: Id) => provider.isElementActive(id),
      isAllActive: () => provider.isAllActive(),
      isGroupActive: (groupId: Id) => provider.isGroupActive(groupId),
      isGroupPartiallyActive: (groupId: Id) =>
        provider.isGroupPartiallyActive(groupId),
    }),
    [provider, current],
  );
}
