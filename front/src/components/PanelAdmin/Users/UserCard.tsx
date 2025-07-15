"use client"
import { IProfileData } from "@/Interfaces/IUser";
import React, { useState } from "react";
import DeleteUser from "./DeleteUser"; // Componente para manejar la eliminación
import { SubscriptionType } from "./UsersComponent";

interface UserCardProps {
  user: IProfileData;
  onDelete: (id: string) => void; // Nueva prop para pasar la función de eliminar
  onSubscriptionChange: (userId: string, newSubscriptionType: SubscriptionType) => Promise<void>;
}

const UserCard: React.FC<UserCardProps> = ({ user, onDelete, onSubscriptionChange }) => {
  const [isChanging, setIsChanging] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionType>(
    (user.subscriptionType as SubscriptionType) || 'Amateur'
  );
  
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

  const handleSubscriptionChange = async () => {
    if (selectedSubscription === subscriptionType) return;
    
    try {
      setIsChanging(true);
      await onSubscriptionChange(id || '', selectedSubscription);
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
        <span className={`
          ${subscriptionType === 'Profesional' ? 'text-green-600 font-bold' : ''} 
          ${subscriptionType === 'Semiprofesional' ? 'text-blue-600 font-bold' : ''} 
          ${subscriptionType === 'Amateur' || !subscriptionType ? 'text-gray-600' : ''}
        `}>
          {subscriptionType || "Amateur"}
        </span>
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {/* Subscription selector */}
        <div className="flex items-center gap-2">
          <select 
            value={selectedSubscription}
            onChange={(e) => setSelectedSubscription(e.target.value as SubscriptionType)}
            className="flex-1 p-2 border border-gray-300 rounded text-sm"
            disabled={isChanging}
          >
            <option value="Amateur">Amateur</option>
            <option value="Semiprofesional">Semiprofesional</option>
            <option value="Profesional">Profesional</option>
          </select>
          
          <button
            onClick={handleSubscriptionChange}
            disabled={isChanging || selectedSubscription === subscriptionType}
            className={`px-3 py-2 rounded-md font-medium text-sm transition-colors ${
              isChanging ? 'bg-gray-200 text-gray-500' : 
              selectedSubscription === subscriptionType ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
              'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
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
            ) : 'Aplicar'}
          </button>
        </div>

        {/* Delete user button */}
        <DeleteUser userId={id} onUserDeleted={onDelete} />
      </div>
    </div>
  );
};

export default UserCard;
