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
  private target: Nullable<LeafletMap> = null;
  private elements = new Map<Id, LiaElement>();
  private instances = new Map<Id, LeafletLayer>();
  private bboxes = new Map<Id, LatLngBoundsLiteral>();
  private activeIds = new Set<Id>();
  private callbacks = new Set<Callback>();
  private clickCallbacks = new Set<ClickCallback>();

  public constructor(target: Nullable<LeafletMap>) {
    this.target = target;
  }

  public register(
    elements: LiaElement[],
    { active = false, pmIgnore, pathOptions }: RegisterElementOptions = {},
  ): void {
    for (const e of elements) {
      const wasActive = this.isActive(e.id);

      if (this.elements.has(e.id)) {
        this.removeElement(e.id);
      }

      this.elements.set(e.id, e);

      const instance = new LeafletGeoJSON(e.geojson, {
        style: pathOptions,
        pmIgnore,
      });

      instance.on("click", () => this.notifyClick(e.id));

      this.instances.set(e.id, instance);
      this.bboxes.set(e.id, e.bbox);

      if (wasActive || active) {
        this.activeIds.add(e.id);

        if (this.target) {
          instance.addTo(this.target);
        }
      }
    }

    this.notify();
  }

  public removeElement(id: Id): void {
    const instance = this.instances.get(id);

    if (instance && this.target) {
      this.target.removeLayer(instance);
    }

    this.instances.delete(id);
    this.elements.delete(id);
    this.bboxes.delete(id);
    this.activeIds.delete(id);

    this.notify();
  }

  public setTarget(other: Nullable<LeafletMap>): void {
    this.target = other;

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

  public activate(id: Id): void {
    const instance = this.instances.get(id);

    if (!instance) {
      return;
    }

    this.activeIds.add(id);

    if (this.target && !this.target.hasLayer(instance)) {
      instance.addTo(this.target);
    }

    this.notify();
  }

  public deactivate(id: Id): void {
    const instance = this.instances.get(id);

    if (!instance) {
      return;
    }

    this.activeIds.delete(id);

    if (this.target && this.target.hasLayer(instance)) {
      this.target.removeLayer(instance);
    }

    this.notify();
  }

  public toggleElement(id: Id): void {
    const instance = this.instances.get(id);

    if (!instance) {
      return;
    }

    if (this.activeIds.has(id)) {
      this.activeIds.delete(id);

      if (this.target && this.target.hasLayer(instance)) {
        this.target.removeLayer(instance);
      }
    } else {
      this.activeIds.add(id);

      if (this.target && !this.target.hasLayer(instance)) {
        instance.addTo(this.target);
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

        if (this.target && !this.target.hasLayer(instance)) {
          instance.addTo(this.target);
        }
      } else {
        this.activeIds.delete(e.id);

        if (this.target && this.target.hasLayer(instance)) {
          this.target.removeLayer(instance);
        }
      }
    }

    this.notify();
  }

  public fitBbox(id: Id, options?: LeafletFitBoundsOptions): void {
    const bbox = this.bboxes.get(id);

    if (bbox && this.target) {
      this.target.fitBounds(bbox, options);
    }
  }

  public getElements(): Map<Id, LiaElement> {
    return this.elements;
  }

  public has(id: Id): boolean {
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

  public isActive(id: Id): boolean {
    return this.activeIds.has(id);
  }

  public isGroupActive(groupId: Id): boolean {
    let hasElement = false;

    for (const e of this.elements.values()) {
      if (e.groupId !== groupId) {
        continue;
      }

      hasElement = true;

      if (!this.isActive(e.id)) {
        return false;
      }
    }

    return hasElement;
  }

  public isGroupIndeterminate(groupId: Id): boolean {
    let activeCount = 0;
    let totalCount = 0;

    for (const e of this.elements.values()) {
      if (e.groupId !== groupId) {
        continue;
      }

      totalCount++;

      if (this.isActive(e.id)) {
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
