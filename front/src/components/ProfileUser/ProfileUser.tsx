"use client"
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../Context/UserContext';
import { IRegisterUser } from '@/Interfaces/IUser';
import { useRouter } from 'next/navigation';

const Profile = () => {
  const { token, logOut } = useContext(UserContext);
  const router = useRouter();
  const [userData, setUserData] = useState<IRegisterUser | null>(null);
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
              setUserData(data);
              setFormData(data); // Inicializa formData con los datos obtenidos
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
      return prevData; // En caso de que prevData sea null, no se realiza el cambio
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
          'Authorization': `Bearer ${token}`,  // Envía el token para autenticación
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        throw new Error('Error al actualizar los datos.');
      }
  
      const updatedData = await response.json();
      setUserData(updatedData);
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
          {/* Campo: Nombre */}
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
  
          {/* Campo: Apellido */}
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
  
          {/* Campo: Correo electrónico */}
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
  
          {/* Campo: Rol */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rol</label>
            <input
              type="text"
              name="role"
              id="role"
              value={formData.role || ''}
              onChange={handleChange}
              className="mt-1 p-2 w-full text-gray-700 border border-gray-300 rounded"
            />
          </div>
  
          {/* Campo: URL de imagen */}
          <div>
            <label htmlFor="imgUrl" className="block text-sm font-medium text-gray-700">URL de la imagen de perfil</label>
            <input
              type="text"
              name="imgUrl"
              id="imgUrl"
              value={formData.imgUrl || ''}
              onChange={handleChange}
              className="mt-1 p-2 w-full text-gray-700 border border-gray-300 rounded"
            />
          </div>
  
          {/* Campo: Teléfono */}
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
  
          {/* Campo: Nacionalidad */}
          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Nacionalidad</label>
            <input
              type="text"
              name="nationality"
              id="nationality"
              value={formData.nationality || ''}
              onChange={handleChange}
              className="mt-1 p-2 w-full text-gray-700 border border-gray-300 rounded"
            />
          </div>
  
          {/* Campo: Ubicación */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Ubicación</label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location || ''}
              onChange={handleChange}
              className="mt-1 p-2 w-full text-gray-700 border border-gray-300 rounded"
            />
          </div>
  
          {/* Campo: Género */}
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700">Género</label>
            <input
              type="text"
              name="genre"
              id="genre"
              value={formData.genre || ''}
              onChange={handleChange}
              className="mt-1 p-2 w-full text-gray-700 border border-gray-300 rounded"
            />
          </div>
  
          {/* Campo: Fecha de nacimiento */}
          <div>
            <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
            <input
              type="date"
              name="birthday"
              id="birthday"
              value={formData.birthday ? formData.birthday.toString().slice(0, 10) : ''}
              onChange={handleChange}
              className="mt-1 p-2 w-full text-gray-700 border border-gray-300 rounded"
            />
          </div>
  
          {/* Campo: Altura */}
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700">Altura</label>
            <input
              type="number"
              name="height"
              id="height"
              value={formData.height || ''}
              onChange={handleChange}
              className="mt-1 p-2 w-full border border-gray-300 rounded"
            />
          </div>
  
          {/* Campo: Peso */}
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Peso</label>
            <input
              type="number"
              name="weight"
              id="weight"
              value={formData.weight || ''}
              onChange={handleChange}
              className="mt-1 p-2 w-full text-gray-700 border border-gray-300 rounded"
            />
          </div>
  
          {/* Campo: Pie hábil */}
          <div>
            <label htmlFor="skillfulFoot" className="block text-sm font-medium text-gray-700">Pie hábil</label>
            <input
              type="text"
              name="skillfulFoot"
              id="skillfulFoot"
              value={formData.skillfulFoot || ''}
              onChange={handleChange}
              className="mt-1 p-2 w-full text-gray-700 border border-gray-300 rounded"
            />
          </div>
  
          {/* Campo: Estructura corporal */}
          <div>
            <label htmlFor="bodyStructure" className="block text-sm font-medium text-gray-700">Estructura corporal</label>
            <input
              type="text"
              name="bodyStructure"
              id="bodyStructure"
              value={formData.bodyStructure || ''}
              onChange={handleChange}
              className="mt-1 p-2 w-full text-gray-700 border border-gray-300 rounded"
            />
          </div>
  
          {/* Campo: Habilidades */}
          <div className="md:col-span-2">
            <label htmlFor="habilities" className="block text-sm font-medium text-gray-700">Habilidades</label>
            <input
              type="text"
              name="habilities"
              id="habilities"
              value={formData.habilities?.join(', ') || ''}
              onChange={(e) => {
                const value = e.target.value.split(',').map(item => item.trim());
                setFormData((prevData) => prevData ? { ...prevData, habilities: value } : prevData);
              }}
              className="mt-1 p-2 w-full text-gray-700 border border-gray-300 rounded"
            />
          </div>
  
          {/* Botón de enviar */}
          <div className="md:col-span-3 text-center">
            <button type="submit" className="mt-4 p-2 bg-yellow-500 text-black hover:bg-yellow-600 rounded">
              Guardar cambios
            </button>
          </div>
        </form>
      ) : (
        <div className="flex justify-center items-center space-x-2">
          <span className="text-xl">Cargando...</span>
          <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin" />
        </div>
      )}
        <button
        onClick={handleLogOut}
        className="mt-4 p-2 text-white bg-green-600 rounded"
      >
        Cerrar sesión
      </button>
    </div>
  );
  
  
};

export default Profile;
