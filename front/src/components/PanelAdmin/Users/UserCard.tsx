"use client"
import { IProfileData } from "@/Interfaces/IUser";
import React, { useState } from "react";
import DeleteUser from "./DeleteUser"; // Componente para manejar la eliminación

interface UserCardProps {
  user: IProfileData;
  onDelete: (id: string) => void; // Nueva prop para pasar la función de eliminar
  onSubscriptionChange: (userId: string, newStatus: boolean) => Promise<void>;
}

const UserCard: React.FC<UserCardProps> = ({ user, onDelete, onSubscriptionChange }) => {
  const [isChanging, setIsChanging] = useState(false);
  const {
    id, // ID del usuario
    name,
    lastname,
    role,
    email,
    nameAgency,
    phone,
    nationality,
    location,
    genre,
    birthday,
    subscriptionType,
  } = user;

  const isProfesional = subscriptionType === 'Profesional';

  const handleSubscriptionToggle = async () => {
    try {
      setIsChanging(true);
      await onSubscriptionChange(id || '', !isProfesional);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 max-w-sm hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-bold text-verde-oscuro mb-2">
        {name} {lastname}
      </h3>
      <p className="text-gray-700">
        <span className="font-semibold">Role:</span> {role}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Email:</span> {email}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Agency:</span> {nameAgency || "N/A"}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Phone:</span> {phone}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Nationality:</span> {nationality}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Location:</span> {location}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Genre:</span> {genre}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Birthday:</span> {new Date(birthday).toLocaleDateString()}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Subscription:</span>{" "}
        <span className={`${isProfesional ? 'text-green-600 font-bold' : 'text-gray-600'}`}>
          {subscriptionType || "Amateur"}
        </span>
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {/* Subscription toggle button */}
        <button
          onClick={handleSubscriptionToggle}
          disabled={isChanging}
          className={`w-full py-2 rounded-md font-medium text-sm transition-colors ${
            isProfesional 
              ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300' 
              : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
          }`}
        >
          {isChanging ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Actualizando...
            </span>
          ) : isProfesional ? (
            'Cambiar a Amateur'
          ) : (
            'Cambiar a Profesional'
          )}
        </button>

        {/* Delete user button */}
        <DeleteUser userId={id} onUserDeleted={onDelete} />
      </div>
    </div>
  );
};

export default UserCard;
