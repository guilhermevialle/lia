# Lia

Lia is a layer management library for Leaflet. It provides a single, predictable interface to register, group, toggle and observe map layers, with a subscription model designed to integrate with reactive UIs.

> **Status: Alpha.** Lia is under active development and its API may change between releases.

## Overview

Managing many GeoJSON layers directly through Leaflet leads to scattered state and repeated boilerplate. Lia centralizes that responsibility in one provider:

- **Element registry** - GeoJSON layers are registered once and identified by id.
- **Groups** - elements share a `groupId`, enabling group-level queries and toggling.
- **Visibility control** - elements are activated, deactivated and toggled without manual layer bookkeeping.
- **Map lifecycle** - the map can be attached, swapped or detached while active elements are preserved.
- **Observability** - state changes and element clicks are exposed through subscriptions.

## Installation

```bash
pnpm add @guivialle/lia
```

Peer dependencies (React 18+, Leaflet, Leaflet-Geoman and the Leaflet type definitions) are installed automatically by modern package managers.

## Quick start

```ts
import { Map } from "leaflet";
import { LiaProvider } from "@guivialle/lia";

const map = new Map("map");
const lia = new LiaProvider(map);

lia.registerElements([
  {
    id: "park",
    groupId: "places",
    geojson: { type: "Point", coordinates: [-46.65, -23.56] },
    bbox: [[-23.57, -46.66], [-23.55, -46.64]],
  },
]);

lia.activateElements(["park"]);
lia.fitToElement("park");
```

## API reference

### Elements

| Method | Description |
| --- | --- |
| `registerElements(elements, options?)` | Registers elements. Pass `{ active: true }` to display them immediately. |
| `destroyElements(ids)` | Removes elements and their layers. |
| `activateElements(ids)` | Displays elements on the map. |
| `deactivateElements(ids)` | Hides elements from the map. |
| `toggleElements(ids)` | Inverts the visibility of each element. |
| `fitToElement(id, options?)` | Fits the map view to the element bounds. |

### Groups

| Method | Description |
| --- | --- |
| `toggleGroup(groupId)` | Activates a group, or deactivates it when fully active. |
| `hasGroup(groupId)` | Whether the group has registered elements. |
| `isGroupActive(groupId)` | Whether every element in the group is active. |
| `isGroupPartiallyActive(groupId)` | Whether only some elements in the group are active. |

### Queries

| Method | Description |
| --- | --- |
| `getElements()` | Returns all registered elements as a `Map<Id, LiaElement>`. |
| `hasElement(id)` | Whether the element is registered. |
| `isElementActive(id)` | Whether the element is currently active. |

### Map

| Method | Description |
| --- | --- |
| `attachMap(map)` | Attaches or replaces the map. Active elements are added to it. |
| `detachMap()` | Removes active elements from the map and unlinks it. |

### Events

| Method | Description |
| --- | --- |
| `subscribe(callback)` | Invoked on every state change. Returns an unsubscribe function. |
| `onElementClick(callback)` | Invoked with the element id when an element is clicked. Returns an unsubscribe function. |

```ts
const unsubscribe = lia.subscribe(() => console.log("state changed"));
const stop = lia.onElementClick((id) => console.log("clicked", id));
```

## React

### `useLiaQuery(provider)`

Reactive bridge between a `LiaProvider` instance and React, built on `useSyncExternalStore`. The component re-renders whenever the provider notifies a state change, so the returned queries always reflect the current state.

| Query | Description |
| --- | --- |
| `isElementActive(id)` | Whether the element is currently active. |
| `isGroupActive(groupId)` | Whether every element in the group is active. |
| `isGroupPartiallyActive(groupId)` | Whether only some elements in the group are active. |

```tsx
import { useLiaQuery } from "@guivialle/lia";

function GroupToggle({ lia, groupId }: { lia: LiaProvider; groupId: string }) {
  const { isGroupActive, isGroupPartiallyActive } = useLiaQuery(lia);

  return (
    <input
      type="checkbox"
      checked={isGroupActive(groupId)}
      ref={(el) => {
        if (el) el.indeterminate = isGroupPartiallyActive(groupId);
      }}
      onChange={() => lia.toggleGroup(groupId)}
    />
  );
}
```

Commands such as `registerElements` or `toggleGroup` are called directly on the provider; they notify subscribers, so no hook is needed to write.

## License

[MIT](LICENSE)
