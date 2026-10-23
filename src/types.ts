import { GeoJSON } from "geojson";
import { LatLngBoundsLiteral } from "leaflet";

export type ElementId = string;

export type LiaElement = {
  id: ElementId;
  groupId: string;
  geojson: GeoJSON;
  bounds: LatLngBoundsLiteral;
};

export type Listener = () => void;
export type ClickListener = (id: string) => void;
export type Nullable<T> = T | null | undefined;

export type RegisterElementOptions = {
  pmIgnore?: boolean;
};
