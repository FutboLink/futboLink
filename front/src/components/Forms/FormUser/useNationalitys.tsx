import { useEffect, useState } from 'react';

interface Country {
  cca2: string;
  name: {
    common: string;
  };
}

interface NationalityOption {
  value: string;
  label: string;
}

const useNationalities = () => {
  const [nationalities, setNationalities] = useState<NationalityOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all')
      .then((response) => response.json())
      .then((data: Country[]) => {
        // Mapeamos los datos y los ordenamos alfabéticamente
        const nationalityOptions: NationalityOption[] = data
          .map((country) => ({
            value: country.cca2,
            label: country.name.common,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)); // Ordenamos por nombre alfabéticamente

        setNationalities(nationalityOptions);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar las nacionalidades");
        setLoading(false);
      });
  }, []);

  return { nationalities, loading, error };
};

export default useNationalities;
