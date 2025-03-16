
import { PropertyImage } from './property/PropertyImageTypes';

export interface AreaImage {
  id: string;
  url: string;
  type?: string;
}

export interface Area {
  id: string;
  name?: string;
  size?: string;
  title?: string;
  description?: string;
  images?: PropertyImage[] | string[] | { url: string; id: string; }[];
  imageIds?: string[];
  columns?: number;
}
