export interface IFilter {
  contracts: string[];
  positions: string[];
  country: string;
  location: string;
  category: string;
}

export interface IFiltersProps {
  locations: string[];
  categories: string[];
  selectedLocation: string;
  selectedCategory: string;
  onLocationChange: (location: string) => void;
  onCategoryChange: (category: string) => void;
  onFilterChange: (filters: IFilter) => void;
}
