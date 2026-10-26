# Lia

A library that makes Leaflet layer management simple and reactive.

> **Alpha:** this project is a work in progress. The API may change at any time.

## Usage

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

## API

### Elements

```ts
lia.registerElements(elements, { active: true }); // add elements, optionally active
lia.destroyElements(["park"]);                    // remove elements
lia.activateElements(["park"]);                   // show on the map
lia.deactivateElements(["park"]);                 // hide from the map
lia.toggleElements(["park"]);                     // flip visibility
lia.fitToElement("park");                         // fit the map to the element bounds
```

### Groups

```ts
lia.toggleGroup("places");               // activate or deactivate a whole group
lia.isGroupActive("places");             // every element is active
lia.isGroupPartiallyActive("places");    // some elements are active
lia.hasGroup("places");
```

### Queries

```ts
lia.getElements();           // Map<Id, LiaElement>
lia.hasElement("park");
lia.isElementActive("park");
```

### Map

```ts
lia.attachMap(map); // attach (or swap) the map, active elements are re-added
lia.detachMap();    // remove active elements from the map and unlink it
```

### Events

```ts
const unsubscribe = lia.subscribe(() => console.log("state changed"));
const stop = lia.onElementClick((id) => console.log("clicked", id));
```
