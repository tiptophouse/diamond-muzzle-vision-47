
import { 
  shapes, 
  colors, 
  clarities, 
  cuts, 
  fluorescences, 
  polishGrades, 
  symmetryGrades, 
  girdleTypes, 
  culetGrades, 
  labOptions, 
  statuses 
} from './diamondFormConstants';

export interface Option {
  value: string;
  label: string;
}

const convertToOptions = (items: string[]): Option[] => {
  return items.map(item => ({ value: item, label: item }));
};

export const shapeOptions = convertToOptions(shapes);
export const colorOptions = convertToOptions(colors);
export const clarityOptions = convertToOptions(clarities);
export const cutOptions = convertToOptions(cuts);
export const fluorescenceOptions = convertToOptions(fluorescences);
export const polishOptions = convertToOptions(polishGrades);
export const symmetryOptions = convertToOptions(symmetryGrades);
export const girdleOptions = convertToOptions(girdleTypes);
export const culetOptions = convertToOptions(culetGrades);
export const labOptionsList = convertToOptions(labOptions);
export const statusOptions = convertToOptions(statuses);
