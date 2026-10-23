import { GeoJSON } from "geojson";
import {
  LatLngBoundsLiteral,
  GeoJSONOptions as LeafletGeoJSONOptions,
} from "leaflet";

export type Id = string;

export type LiaElement = {
  id: Id;
  groupId: Id;
  geojson: GeoJSON;
  bbox: LatLngBoundsLiteral;
};

export type Callback = () => void;
export type ClickCallback = (id: string) => void;
export type Nullable<T> = T | null | undefined;

export type RegisterElementOptions = LeafletGeoJSONOptions & {
  active?: boolean;
};
