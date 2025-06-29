"use client" 
import React, { useEffect, useState } from "react";
import UserCard from "./UserCard";
import { getUsers } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch";
import { IProfileData } from "@/Interfaces/IUser";
import { useSubscription } from "@/components/Context/SubscriptionContext";
import { SubscriptionProvider } from "@/components/Context/SubscriptionContext";

// Internal component that uses the subscription context
const UsersComponentWithContext = () => {
  const { updateSubscription, isLoading: subscriptionLoading } = useSubscription();
  
  const [users, setUsers] = useState<IProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserDeleted = (deletedId: string) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== deletedId));
  };

  const handleSubscriptionChange = async (userId: string, newStatus: boolean) => {
    try {
      await updateSubscription(userId, newStatus);
      // Update local state to reflect the change
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? {...user, subscriptionType: newStatus ? 'Profesional' : 'Amateur'} 
            : user
        )
      );
    } catch (error) {
      console.error("Failed to update subscription:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    const matchesSearch =
      searchFilter
        ? (user.name && user.name.toLowerCase().includes(searchFilter.toLowerCase())) ||
          (user.nationality && user.nationality.toLowerCase().includes(searchFilter.toLowerCase()))
        : true;

    return matchesRole && matchesSearch;
  });

  if (isLoading || subscriptionLoading) {
    return <p className="text-center text-verde-oscuro mt-40">Cargando usuarios</p>;
  }
  return (
    <div className="container mx-auto mt-28 p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <label className="mr-2 font-bold text-gray-600">Rol:</label>
          <select
            className="border rounded p-2 text-gray-600 hover:cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="ADMIN">Admin</option>
            <option value="PLAYER">Candidato</option>
            <option value="AGENCY">Agencia</option>
            <option value="RECRUITER">Ofertante</option>
          </select>
        </div>

        <div>
          <label className="mr-2 font-bold text-gray-600">Buscar por nombre o país:</label>
          <input
            type="text"
            placeholder="Ingrese nombre o país"
            className="border rounded p-2 text-gray-600 hover:cursor-pointer"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <p className="text-center text-red-500 mt-4">Usuario no encontrado</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <UserCard 
            key={user.id} 
            user={user} 
            onDelete={handleUserDeleted} 
            onSubscriptionChange={handleSubscriptionChange}
          />
        ))}
      </div>
    </div>
  );
};

// Wrapper component that includes the provider if needed
const UsersComponent = () => {
  // Try to use the context to see if we're already inside a provider
  const contextAvailable = (() => {
    try {
      useSubscription();
      return true;
    } catch (e) {
      return false;
    }
  })();

  // If we're already inside a provider, just render the component
  // Otherwise, wrap it in our own provider
  return contextAvailable ? (
    <UsersComponentWithContext />
  ) : (
    <SubscriptionProvider>
      <UsersComponentWithContext />
    </SubscriptionProvider>
  );
};

export default UsersComponent;
