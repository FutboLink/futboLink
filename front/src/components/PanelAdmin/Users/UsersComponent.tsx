"use client"
import React, { useEffect, useState, useCallback, useContext } from "react";
import UserCard from "./UserCard";
import { getUsers, getUserStats, UserStats } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch";
import { IProfileData } from "@/Interfaces/IUser";
import { useSubscription } from "@/components/Context/SubscriptionContext";
import { SubscriptionProvider } from "@/components/Context/SubscriptionContext";
import { UserContext } from "@/components/Context/UserContext";
import { FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";

export type SubscriptionType = 'Amateur' | 'Semiprofesional' | 'Profesional';

const USERS_PER_PAGE = 300;

// Internal component that uses the subscription context
const UsersComponentWithContext = () => {
  const { updateSubscription, isLoading: subscriptionLoading } = useSubscription();
  const { token } = useContext(UserContext);

  const [users, setUsers] = useState<IProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  // T7.1 — separate nationality filter state
  const [nationalityFilter, setNationalityFilter] = useState("");

  // T7.1 — server-fetched stats state
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsError, setStatsError] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // T7.4 — fetchUsersPage forwards role, nationality, email opts
  const fetchUsersPage = useCallback(async (
    page: number,
    opts?: { email?: string; role?: string; nationality?: string },
  ) => {
      try {
      setIsPageLoading(true);
      const result = await getUsers(page, USERS_PER_PAGE, opts);
      setUsers(result.data);
      setTotalUsers(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
      setIsPageLoading(false);
        setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchUsersPage(1);
  }, [fetchUsersPage]);

  // T7.4 — debounced effect for all three filters
  useEffect(() => {
    const id = setTimeout(() => {
      fetchUsersPage(1, {
        email: emailFilter || undefined,
        role: roleFilter || undefined,
        nationality: nationalityFilter || undefined,
      });
    }, 300);
    return () => clearTimeout(id);
  }, [emailFilter, roleFilter, nationalityFilter, fetchUsersPage]);

  // T7.5 — mount-only stats fetch
  useEffect(() => {
    if (!token) return;
    getUserStats(token)
      .then(setStats)
      .catch(() => setStatsError(true));
  }, [token]);

  // T7.4 — handlePageChange passes current filters
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchUsersPage(page, {
      email: emailFilter || undefined,
      role: roleFilter || undefined,
      nationality: nationalityFilter || undefined,
    });
  };

  const handleUserDeleted = (deletedId: string) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== deletedId));
    setTotalUsers((prev) => prev - 1);
  };

  // Updated to use SubscriptionType
  const handleSubscriptionChange = async (userId: string, newSubscriptionType: SubscriptionType) => {
    try {
      await updateSubscription(userId, newSubscriptionType);
      // Update local state to reflect the change
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? {...user, subscriptionType: newSubscriptionType}
            : user
        )
      );
    } catch (error) {
      console.error("Failed to update subscription:", error);
    }
  };

  // T7.1 — role filtering is now server-side; no client-side filteredUsers needed
  const filteredUsers = users;

  if (isLoading || subscriptionLoading) {
    return <p className="text-center text-verde-oscuro mt-40">Cargando usuarios</p>;
  }

  // Calcular rango de usuarios mostrados
  const startUser = (currentPage - 1) * USERS_PER_PAGE + 1;
  const endUser = Math.min(currentPage * USERS_PER_PAGE, totalUsers);

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="container mx-auto mt-28 p-6">
      {/* T7.5 — Stats panel sourced from server */}
      <div className="mb-6 bg-white shadow-md rounded-lg p-4 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-700 mb-2">Estadísticas de Usuarios</h2>
        {statsError ? (
          <p className="text-sm text-gray-400">No se pudieron cargar las estadísticas.</p>
        ) : !stats ? (
          <p className="text-sm text-gray-400">Cargando estadísticas...</p>
        ) : (
          <>
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-600 mb-1">Por rol</p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-blue-50 rounded-lg p-3 flex-1 min-w-[120px] border border-blue-200">
                  <p className="text-sm text-gray-600">Total de usuarios</p>
                  <p className="text-2xl font-bold text-blue-700">{totalUsers}</p>
                </div>
                {(stats.byRole ?? []).length === 0 ? (
                  <p className="text-sm text-gray-400">Sin datos de roles.</p>
                ) : (
                  (stats.byRole ?? []).map(({ role, count }) => (
                    <div key={role} className="bg-gray-50 rounded-lg p-3 flex-1 min-w-[120px] border border-gray-200">
                      <p className="text-sm text-gray-600">{role}</p>
                      <p className="text-2xl font-bold text-gray-700">{count}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-600 mb-1">Top nacionalidades</p>
              <div className="flex flex-wrap gap-2">
                {(stats.byNationality ?? []).length === 0 ? (
                  <p className="text-sm text-gray-400">Sin datos de nacionalidades.</p>
                ) : (
                  (stats.byNationality ?? []).map(({ nationality, count }) => (
                    <div key={nationality} className="bg-green-50 rounded px-3 py-2 border border-green-200 text-sm">
                      <span className="font-medium capitalize">{nationality}</span>
                      <span className="ml-2 font-bold text-green-700">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Posiciones (jugadores)</p>
              <div className="flex flex-wrap gap-2">
                {(stats.byPosition ?? []).length === 0 ? (
                  <p className="text-sm text-gray-400">Sin datos de posiciones.</p>
                ) : (
                  (stats.byPosition ?? []).map(({ position, count }) => (
                    <div key={position} className="bg-yellow-50 rounded px-3 py-2 border border-yellow-200 text-sm">
                      <span className="font-medium capitalize">{position}</span>
                      <span className="ml-2 font-bold text-yellow-700">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        {/* T7.2 — Role dropdown with all 6 UserType values */}
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
            <option value="CLUB">Club</option>
            <option value="USER">Usuario</option>
          </select>
        </div>

        {/* T7.3 — Name/email input (server-side via email param) */}
        <div>
          <label className="mr-2 font-bold text-gray-600">Buscar por nombre:</label>
          <input
            type="text"
            placeholder="Ingrese nombre"
            className="border rounded p-2 text-gray-600 hover:cursor-pointer"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
          />
        </div>

        {/* T7.3 — Separate nationality input */}
        <div>
          <label className="mr-2 font-bold text-gray-600">Buscar por país:</label>
          <input
            type="text"
            placeholder="Ingrese país"
            className="border rounded p-2 text-gray-600 hover:cursor-pointer"
            value={nationalityFilter}
            onChange={(e) => setNationalityFilter(e.target.value)}
          />
        </div>

        <div className="text-sm text-gray-500">
          Mostrando {startUser}-{endUser} de {totalUsers} usuarios
        </div>
      </div>

      {/* Indicador de carga de página */}
      {isPageLoading && (
        <div className="flex justify-center items-center py-4">
          <FaSpinner className="animate-spin h-6 w-6 text-emerald-600 mr-2" />
          <span className="text-gray-600">Cargando página...</span>
        </div>
      )}

      {filteredUsers.length === 0 && !isPageLoading && (
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPageLoading}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronLeft className="h-3 w-3" />
            Anterior
          </button>

          <div className="flex gap-1">
            {getPageNumbers().map((page, index) =>
              page === '...' ? (
                <span key={`dots-${index}`} className="px-3 py-2 text-gray-400">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page as number)}
                  disabled={isPageLoading}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    page === currentPage
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-emerald-400'
                  } disabled:cursor-not-allowed`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isPageLoading}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <FaChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}
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
