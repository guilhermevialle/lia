import "@geoman-io/leaflet-geoman-free";
import {
  LatLngBoundsLiteral,
  FitBoundsOptions as LeafletFitBoundsOptions,
  GeoJSON as LeafletGeoJSON,
  Layer as LeafletLayer,
  Map as LeafletMap,
} from "leaflet";

import {
  Callback,
  ClickCallback,
  Id,
  LiaElement,
  Nullable,
  RegisterElementOptions,
} from "./types";

export class LiaProvider {
  private map: Nullable<LeafletMap> = null;
  private elements = new Map<Id, LiaElement>();
  private instances = new Map<Id, LeafletLayer>();
  private bboxes = new Map<Id, LatLngBoundsLiteral>();
  private activeIds = new Set<Id>();
  private callbacks = new Set<Callback>();
  private clickCallbacks = new Set<ClickCallback>();

  public constructor(map: Nullable<LeafletMap>) {
    this.map = map;
  }

  public registerElements(
    elements: LiaElement[],
    { active = false, ...options }: RegisterElementOptions = {},
  ): void {
    for (const e of elements) {
      const wasActive = this.isElementActive(e.id);

      if (this.elements.has(e.id)) {
        this.destroyElements([e.id]);
      }

      this.elements.set(e.id, e);

      const instance = new LeafletGeoJSON(e.geojson, options);

      instance.on("click", () => this.notifyClick(e.id));

      this.instances.set(e.id, instance);
      this.bboxes.set(e.id, e.bbox);

      if (wasActive || active) {
        this.activeIds.add(e.id);

        if (this.map) {
          instance.addTo(this.map);
        }
      }
    }

    this.notify();
  }

  public destroyElements(ids: Id[]): void {
    for (const id of ids) {
      const instance = this.instances.get(id);

      if (instance && this.map) {
        this.map.removeLayer(instance);
      }

      this.instances.delete(id);
      this.elements.delete(id);
      this.bboxes.delete(id);
      this.activeIds.delete(id);
    }

    this.notify();
  }

  public attachMap(other: Nullable<LeafletMap>): void {
    this.map = other;

    if (other) {
      this.activeIds.forEach((id) => {
        const instance = this.instances.get(id);

        if (instance && !other.hasLayer(instance)) {
          instance.addTo(other);
        }
      });
    }

    this.notify();
  }

  public activateElements(ids: Id[]): void {
    for (const id of ids) {
      const instance = this.instances.get(id);

      if (!instance) {
        continue;
      }

      this.activeIds.add(id);

      if (this.map && !this.map.hasLayer(instance)) {
        instance.addTo(this.map);
      }
    }

    this.notify();
  }

  public deactivateElements(ids: Id[]): void {
    for (const id of ids) {
      const instance = this.instances.get(id);

      if (!instance) {
        continue;
      }

      this.activeIds.delete(id);

      if (this.map && this.map.hasLayer(instance)) {
        this.map.removeLayer(instance);
      }
    }

    this.notify();
  }

  public toggleElements(ids: Id[]): void {
    for (const id of ids) {
      const instance = this.instances.get(id);

      if (!instance) {
        continue;
      }

      if (this.activeIds.has(id)) {
        this.activeIds.delete(id);

        if (this.map && this.map.hasLayer(instance)) {
          this.map.removeLayer(instance);
        }
      } else {
        this.activeIds.add(id);

        if (this.map && !this.map.hasLayer(instance)) {
          instance.addTo(this.map);
        }
      }
    }

    this.notify();
  }

  public toggleGroup(groupId: Id): void {
    const shouldActivate = !this.isGroupActive(groupId);

    for (const e of this.elements.values()) {
      if (e.groupId !== groupId) {
        continue;
      }

      const instance = this.instances.get(e.id);

      if (!instance) {
        continue;
      }

      if (shouldActivate) {
        this.activeIds.add(e.id);

        if (this.map && !this.map.hasLayer(instance)) {
          instance.addTo(this.map);
        }
      } else {
        this.activeIds.delete(e.id);

        if (this.map && this.map.hasLayer(instance)) {
          this.map.removeLayer(instance);
        }
      }
    }

    this.notify();
  }

  public fitToElement(id: Id, options?: LeafletFitBoundsOptions): void {
    const bbox = this.bboxes.get(id);

    if (bbox && this.map) {
      this.map.fitBounds(bbox, options);
    }
  }

  public getElements(): Map<Id, LiaElement> {
    return this.elements;
  }

  public hasElement(id: Id): boolean {
    return this.elements.has(id);
  }

  public hasGroup(groupId: Id): boolean {
    for (const e of this.elements.values()) {
      if (e.groupId === groupId) {
        return true;
      }
    }

    return false;
  }

  public isElementActive(id: Id): boolean {
    return this.activeIds.has(id);
  }

  public isGroupActive(groupId: Id): boolean {
    let hasElement = false;

    for (const e of this.elements.values()) {
      if (e.groupId !== groupId) {
        continue;
      }

      hasElement = true;

      if (!this.isElementActive(e.id)) {
        return false;
      }
    }

    return hasElement;
  }

  public isGroupPartiallyActive(groupId: Id): boolean {
    let activeCount = 0;
    let totalCount = 0;

    for (const e of this.elements.values()) {
      if (e.groupId !== groupId) {
        continue;
      }

      totalCount++;

      if (this.isElementActive(e.id)) {
        activeCount++;
      }
    }

    return activeCount > 0 && activeCount < totalCount;
  }

  public subscribe(cb: Callback): () => void {
    this.callbacks.add(cb);

    return () => {
      this.callbacks.delete(cb);
    };
  }

  public onElementClick(cb: ClickCallback): () => void {
    this.clickCallbacks.add(cb);

    return () => {
      this.clickCallbacks.delete(cb);
    };
  }

  public notify(): void {
    this.callbacks.forEach((cb) => cb());
  }

  public notifyClick(id: Id): void {
    this.clickCallbacks.forEach((cb) => cb(id));
  }
}
