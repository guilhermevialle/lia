import {
  LatLngBoundsLiteral,
  Layer as LeafletLayer,
  Map as LeafletMap,
} from "leaflet";

import {
  ClickListener,
  ElementId,
  LiaElement,
  Listener,
  Nullable,
} from "./types";

export class LiaProvider {
  private target: Nullable<LeafletMap> = null;
  private elements = new Map<ElementId, LiaElement>();
  private instances = new Map<ElementId, LeafletLayer>();
  private bboxes = new Map<ElementId, LatLngBoundsLiteral>();
  private activeIds = new Set<ElementId>();
  private listeners = new Set<Listener>();
  private clickListeners = new Set<ClickListener>();
}
