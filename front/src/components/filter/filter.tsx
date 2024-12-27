// components/Filters.tsx
import React from "react";

interface FiltersProps {
  locations: string[];
  categories: string[];
  selectedLocation: string;
  selectedCategory: string;
  onLocationChange: (location: string) => void;
  onCategoryChange: (category: string) => void;
}

const Filters: React.FC<FiltersProps> = ({
  locations,
  categories,
  selectedLocation,
  selectedCategory,
  onLocationChange,
  onCategoryChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-6 mb-8 justify-center">
      <div>
        <label htmlFor="location" className="block font-semibold">
          Ubicación
        </label>
        <select
          id="location"
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="">Todas</option>
          {locations.map((location, index) => (
            <option key={index} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="category" className="block font-semibold">
          Categoría
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="">Todas</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Filters;
