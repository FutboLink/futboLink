"use client"
import React, { useState, useEffect } from 'react';
import { IProfileData } from '@/Interfaces/IUser';
import CV from '@/components/ProfileUser/CvComponent';

export default function Page() {
  const [userData, setUserData] = useState<IProfileData | null>(null);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<IProfileData | null>(null);

  const token = localStorage.getItem('token'); // O usa el método que uses para obtener el token
  const apiUrl = 'https://api.example.com'; // Reemplaza con la URL de tu API

  useEffect(() => {
    if (token) {
      try {
        // Decodifica el token y obtiene el userId
        const userId = JSON.parse(atob(token.split('.')[1])).id;

        if (userId) {
          // Realiza la solicitud para obtener los datos del usuario por id
          fetch(`${apiUrl}/user/${userId}`)
            .then((response) => {
              if (!response.ok) {
                throw new Error('Failed to fetch user data');
              }
              return response.json();
            })
            .then((data) => {
              setUserData(data); // Guarda los datos del usuario
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

  // Si no hay datos del usuario, muestra un cargando
  if (!userData) {
    return <div>Cargando...</div>;
  }

  return <CV userData={userData} error={error} />;
}
