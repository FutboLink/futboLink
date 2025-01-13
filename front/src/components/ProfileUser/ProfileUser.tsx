"use client";
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../Context/UserContext';
import { IRegisterUser } from '@/Interfaces/IUser';
import { useRouter } from 'next/navigation';

const Profile = () => {
  const { token, logOut } = useContext(UserContext);
  const router = useRouter();
  const [formData, setFormData] = useState<IRegisterUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (token) {
      try {
        const userId = JSON.parse(atob(token.split('.')[1])).id;

        if (userId) {
          fetch(`${apiUrl}/user/${userId}`)
            .then((response) => {
              if (!response.ok) {
                throw new Error('Failed to fetch user data');
              }
              return response.json();
            })
            .then((data) => {
              setFormData(data);
            })
            .catch((error) => {
              console.error('Error fetching user data:', error);
              setError('Failed to load user data.');
            });
        }
      } catch (error) {
        setError('Error decoding token or fetching user data.');
        console.error('Error:', error);
      }
    }
  }, [token, apiUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      if (prevData) {
        return {
          ...prevData,
          [name]: value,
        };
      }
      return prevData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !formData) {
      setError('No se pudo actualizar. Intenta iniciar sesión nuevamente.');
      return;
    }

    try {
      const userId = JSON.parse(atob(token.split('.')[1])).id;

      const response = await fetch(`${apiUrl}/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar los datos.');
      }

      alert('Datos actualizados correctamente');
    } catch (error) {
      console.error('Error actualizando los datos:', error);
      setError('Ocurrió un error al actualizar los datos.');
    }
  };

  const handleLogOut = () => {
    logOut();
    router.push('/login');
  };

  return (
    <div className="max-w-6xl mx-auto mt-24 p-4">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : formData ? (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="mt-1 p-2 w-full text-gray-700 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">Apellido</label>
            <input
              type="text"
              name="lastname"
              id="lastname"
              value={formData.lastname || ''}
              onChange={handleChange}
              className="mt-1 p-2 w-full text-gray-700 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="mt-1 p-2 w-full text-gray-700 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="text"
              name="phone"
              id="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className="mt-1 p-2 w-full text-gray-700 border border-gray-300 rounded"
            />
          </div>
          <div className="md:col-span-3 text-center">
            <button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded">
              Guardar cambios
            </button>
            <button type="button" onClick={handleLogOut} className="mt-4 ml-4 p-2 bg-red-500 text-white rounded">
              Cerrar sesión
            </button>
          </div>
        </form>
      ) : (
        <div>Cargando datos...</div>
      )}
    </div>
  );
};

export default Profile;
