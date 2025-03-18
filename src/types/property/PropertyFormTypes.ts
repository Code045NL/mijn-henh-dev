
import { 
  PropertyFeature, 
  PropertyPlaceType, 
  PropertyCity, 
  PropertyAgent, 
  PropertyFloorplan,
  GeneralInfoData
} from './PropertyTypes';
import { PropertyImage } from './PropertyImageTypes';
import { PropertyArea } from './PropertyAreaTypes';
import { PropertyData } from './PropertyDataTypes';

export interface PropertyFormData extends PropertyData {
  images: PropertyImage[];
  coverImages: PropertyImage[];
  gridImages: PropertyImage[];
  floorplans: PropertyFloorplan[];
  // Additional form-specific fields can be added here
}
