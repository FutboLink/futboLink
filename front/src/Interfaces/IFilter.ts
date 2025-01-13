export interface IFilter {
  contracts: string[];
  positions: string[];
  country: string;
  location: string;
  category: string;
}

interface IFiltersProps {
  locations: string[];
  categories: string[];
  selectedLocation: string;
  selectedCategory: string;
  onLocationChange: React.Dispatch<React.SetStateAction<string>>;
  onCategoryChange: React.Dispatch<React.SetStateAction<string>>;
  onFilterChange: (filters: {
    contracts: string[];
    positions: string[];
    country: string;
    location: string;
    category: string;
  }) => void;
  selectedContracts: string[]; // Añadir esta propiedad
  setSelectedContracts: React.Dispatch<React.SetStateAction<string[]>>; // Añadir esta propiedad
}
