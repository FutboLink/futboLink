"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import type React from "react";
import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useUserContext } from "@/hook/useUserContext";
import type { User } from "@/Interfaces/IUser";
import TranslationContext from "../Context/TranslationContext";
import UserCard from "./UserCard";

interface SearchFilters {
  name?: string;
  primaryPosition?: string;
  nationality?: string;
  minAge?: number;
  maxAge?: number;
  minHeight?: number;
  maxHeight?: number;
  skillfulFoot?: string;
  profileType?: string;
  role?: string;
  subscriptionType?: string;
}

const PlayerSearch: React.FC = () => {
  const { user, token } = useUserContext();
  const {
    setLanguage,
    currentLanguage,
    isTranslateReady,
    isTranslating,
    getLanguageName,
  } = useContext(TranslationContext);
  const router = useRouter();

  // Referencia al timeout para búsqueda en tiempo real
  const scrollPositionRef = useRef(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función de traducción simple
  const t = (key: string, params?: Record<string, any>): string => {
    // Implementación básica de traducción
    const translations: Record<string, string> = {
      // Mensajes generales
      needLogin: "Necesitas iniciar sesión para acceder a esta función",
      needProfessionalSubscription:
        "Necesitas una suscripción profesional para acceder a esta función",
      errorCheckingSubscription: "Error al verificar tu suscripción",
      errorSearchingPlayers: "Error al buscar usuarios",
      loading: "Cargando...",
      noPlayersFound: "No se encontraron usuarios con esos criterios",

      // Filtros
      playerSearch: "Búsqueda de Jugadores y Agencias",
      showFilters: "Mostrar filtros",
      hideFilters: "Ocultar filtros",
      nameOrLastname: "Nombre o apellido",
      searchByName: "Buscar por nombre",
      position: "Posición",
      allPositions: "Todas las posiciones",
      nationality: "Nacionalidad",
      allNationalities: "Todas las nacionalidades",
      minAge: "Edad mínima",
      maxAge: "Edad máxima",
      minHeight: "Altura mínima",
      maxHeight: "Altura máxima",
      skillfulFoot: "Pie hábil",
      any: "Cualquiera",
      right: "Derecho",
      left: "Izquierdo",
      both: "Ambos",
      search: "Buscar",
      clearFilters: "Limpiar filtros",
      profileType: "Tipo de perfil",
      allProfiles: "Todos los perfiles",
      userType: "Tipo de usuario",
      allUserTypes: "Todos los tipos",
      playersOnly: "Solo jugadores",
      recruitersOnly: "Solo reclutadores/agencias",

      // Tipos de perfil
      professional: "Profesional",
      semi: "Semi",
      amateur: "Amateur",

      // Roles
      player: "Jugador",
      recruiter: "Reclutador/Agencia",

      // Información de jugador
      age: "Edad",
      height: "Altura",
      weight: "Peso",
      notSpecified: "No especificado",
      viewProfile: "Ver perfil",
      birthdate: "Fecha de nac.",
      location: "Ubicación",
      email: "Email",
      phone: "Teléfono",

      // Paginación
      previous: "Anterior",
      next: "Siguiente",
      page: "Página",
      of: "de",
      showingResults: "Mostrando {showing} de {total} resultados",
      featuredProfile: "Perfil destacado",
      loadMore: "Cargar más",
    };

    let text = translations[key] || key;

    // Reemplazar parámetros si existen
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{${paramKey}}`, String(paramValue));
      });
    }

    return text;
  };

  const [players, setPlayers] = useState<User[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [allPlayersLoaded, setAllPlayersLoaded] = useState<User[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [positions, setPositions] = useState<string[]>([
    "Portero",
    "Defensor central",
    "Lateral derecho",
    "Lateral izquierdo",
    "Mediocampista defensivo",
    "Mediocampista central",
    "Mediocampista ofensivo",
    "Extremo derecho",
    "Extremo izquierdo",
    "Delantero centro",
  ]);
  // Mapa de términos comunes a posiciones oficiales
  const [positionAliases, setPositionAliases] = useState<
    Record<string, string>
  >({
    delantero: "Delantero centro",
    defensa: "Defensor central",
    defensor: "Defensor central",
    mediocampista: "Mediocampista central",
    medio: "Mediocampista central",
    volante: "Mediocampista central",
    "volante defensivo": "Mediocampista defensivo",
    "volante ofensivo": "Mediocampista ofensivo",
    lateral: "Lateral derecho",
    arquero: "Portero",
    guardameta: "Portero",
    extremo: "Extremo derecho",
    atacante: "Delantero centro",
    central: "Defensor central",
    centrocampista: "Mediocampista central",
    zaguero: "Defensor central",
    punta: "Delantero centro",
    goleador: "Delantero centro",
    mediocentro: "Mediocampista central",
    "mediocentro defensivo": "Mediocampista defensivo",
    "mediocentro ofensivo": "Mediocampista ofensivo",
  });
  const [nationalities, setNationalities] = useState<string[]>([
    "Argentina",
    "Brasil",
    "España",
    "Francia",
    "Italia",
    "Alemania",
    "Inglaterra",
    "Portugal",
    "Uruguay",
    "Colombia",
    "México",
    "Chile",
  ]);
  const [profileTypes, setProfileTypes] = useState<string[]>([
    "professional",
    "semi",
    "amateur",
  ]);

  // Agregar estados para manejar la adición a la Portafolio a nivel del componente principal
  const [isAddingToPortfolio, setIsAddingToPortfolio] = useState<string | null>(
    null
  );

  // Agregar una función para obtener la URL de la API
  const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || "https://futbolink.onrender.com";
  };

  // Verificar si el usuario tiene suscripción profesional
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;
    const abortController = new AbortController();

    if (!user || !token) {
      toast.error(t("needLogin"));
      router.push("/Login");
      return;
    }

    console.log("Token disponible:", !!token); // Verificar si el token existe

    // Permitir acceso a usuarios con rol RECRUITER sin verificar suscripción
    if (user.role === "RECRUITER") {
      // Cargar jugadores iniciales directamente
      if (isMounted) {
        searchPlayers();
      }
      return () => {
        isMounted = false;
        abortController.abort();
      };
    }

    // Para otros roles, verificar tipo de suscripción
    axios
      .get(`${getApiUrl()}/user/${user.id}/subscription`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: abortController.signal,
      })
      .then((response) => {
        if (!isMounted) return;
        
        const { subscriptionType, isActive } = response.data;
        // Permitir acceso con suscripción Profesional o Semiprofesional
        const hasPaidSubscription = 
          subscriptionType === "Profesional" || 
          subscriptionType === "Semiprofesional";
        
        if (!hasPaidSubscription || !isActive) {
          toast.error(t("needProfessionalSubscription"));
          router.push("/Subs");
        } else {
          // Cargar jugadores iniciales
          searchPlayers();
        }
      })
      .catch((error) => {
        if (!isMounted || error.name === 'AbortError') return;
        console.error("Error al verificar suscripción:", error);
        toast.error(t("errorCheckingSubscription"));
        router.push("/");
      });

    // Cleanup function
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [user, token, router]);

  // Agregar una función para verificar y refrescar el token
  const verifyToken = async (): Promise<string | null> => {
    if (!token) {
      console.error("No hay token disponible");
      toast.error(t("needLogin"));
      router.push("/Login");
      return null;
    }

    // Verificar si el token está en localStorage
    const userData = localStorage.getItem("user");
    if (!userData) {
      console.error("No hay datos de usuario en localStorage");
      toast.error(t("needLogin"));
      router.push("/Login");
      return null;
    }

    try {
      const parsedUserData = JSON.parse(userData);
      const localToken = parsedUserData.token;

      if (localToken && localToken !== token) {
        console.log("Usando token de localStorage");
        return localToken;
      }

      return token;
    } catch (error) {
      console.error("Error al parsear datos de usuario:", error);
      return token;
    }
  };

  // Función para buscar jugadores
  const searchPlayers = async () => {
    const currentToken = await verifyToken();
    if (!currentToken) return;

    setLoading(true);
    try {
      // Si estamos en la primera página, necesitamos cargar primero todos los profesionales y semiprofesionales
      if (page === 0) {
        await loadPriorityProfiles(currentToken);
        return;
      }

      // Para páginas posteriores, cargar normalmente
      await loadRegularProfiles(currentToken);
    } catch (error) {
      console.error("Error al buscar jugadores:", error);
      toast.error(t("errorSearchingPlayers"));
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar perfiles prioritarios (profesionales y semiprofesionales)
  const loadPriorityProfiles = async (currentToken: string) => {
    try {
      // Cargar perfiles en lotes más pequeños para evitar errores 400 y reducir memoria
      const BATCH_SIZE = 20; // Reducido de 30 a 20 para usar menos memoria
      const MAX_BATCHES = 2; // Mantener en 2 (máximo 40 perfiles en memoria)

      let allLoadedUsers: User[] = [];
      let hasMoreToLoad = true;
      let batchCount = 0;

      console.log("Cargando perfiles prioritarios...");
      console.log(
        "Token usado para la petición:",
        currentToken ? "Disponible" : "No disponible"
      );

      // Cargar perfiles en lotes hasta que no haya más o alcancemos el máximo
      while (hasMoreToLoad && batchCount < MAX_BATCHES) {
        const params = buildSearchParams();
        params.append("limit", String(BATCH_SIZE));
        params.append("offset", String(batchCount * BATCH_SIZE));

        console.log(`Cargando lote ${batchCount + 1}/${MAX_BATCHES}...`);

        try {
          const response = await axios.get(
            `${getApiUrl()}/user/search/users?${params.toString()}`,
            {
              headers: {
                Authorization: `Bearer ${currentToken}`,
              },
            }
          );

          const batchUsers = response.data.users || [];
          allLoadedUsers = [...allLoadedUsers, ...batchUsers];

          // Actualizar el total de jugadores disponibles
          setTotalPlayers(response.data.total || 0);

          // Si recibimos menos usuarios de los solicitados, no hay más para cargar
          if (batchUsers.length < BATCH_SIZE) {
            hasMoreToLoad = false;
            console.log("No hay más perfiles para cargar");
          }

          batchCount++;
        } catch (error) {
          console.error(`Error al cargar lote ${batchCount + 1}:`, error);
          hasMoreToLoad = false; // Detener la carga en caso de error
        }
      }

      // Filtrar y ordenar usuarios por tipo de suscripción
      const sortedUsers = sortPlayersBySubscriptionType(allLoadedUsers);

      // Separar usuarios por tipo de suscripción y rol
      // Función auxiliar para verificar si el usuario tiene una suscripción específica
      const hasSubscription = (
        user: User,
        subscriptionName: string
      ): boolean => {
        return (
          user.subscriptionType === subscriptionName ||
          user.subscription === subscriptionName
        );
      };

      // Función auxiliar para verificar si el usuario es profesional
      const isProfessional = (user: User): boolean => {
        return (
          hasSubscription(user, "Profesional") ||
          hasSubscription(user, "profesional") ||
          hasSubscription(user, "Professional")
        );
      };

      // Función auxiliar para verificar si el usuario es semiprofesional
      const isSemiProfessional = (user: User): boolean => {
        return (
          hasSubscription(user, "Semiprofesional") ||
          hasSubscription(user, "semiprofesional") ||
          hasSubscription(user, "Semi-profesional")
        );
      };

      const professionalPlayers = sortedUsers.filter(
        (user) => isProfessional(user) && user.role === "PLAYER"
      );

      const semiProfessionalPlayers = sortedUsers.filter(
        (user) => isSemiProfessional(user) && user.role === "PLAYER"
      );

      const recruiters = sortedUsers.filter(
        (user) => user.role === "RECRUITER"
      );

      const amateurPlayers = sortedUsers.filter(
        (user) =>
          user.role === "PLAYER" &&
          !isProfessional(user) &&
          !isSemiProfessional(user)
      );

      console.log(
        `Encontrados: ${professionalPlayers.length} profesionales, ${semiProfessionalPlayers.length} semi-profesionales, ${recruiters.length} reclutadores y ${amateurPlayers.length} amateurs`
      );

      // Guardar la lista de amateurs para cargar más tarde
      setAllPlayersLoaded(amateurPlayers);

      // Mostrar primero los profesionales, semiprofesionales y reclutadores
      setPlayers([
        ...professionalPlayers,
        ...semiProfessionalPlayers,
        ...recruiters,
      ]);

      // Si no hay suficientes profesionales/semis/reclutadores para llenar la primera página,
      // cargar algunos amateurs para completar
      const priorityUsersCount =
        professionalPlayers.length +
        semiProfessionalPlayers.length +
        recruiters.length;
      const DISPLAY_LIMIT = 20; // Reducido de 30 a 20 para usar menos memoria
      if (priorityUsersCount < DISPLAY_LIMIT) {
        const amateursToShow = amateurPlayers.slice(0, DISPLAY_LIMIT - priorityUsersCount);
        setPlayers((prev) => [...prev, ...amateursToShow]);

        // Actualizar la lista de amateurs restantes
        setAllPlayersLoaded(amateurPlayers.slice(DISPLAY_LIMIT - priorityUsersCount));
      }
    } catch (error) {
      console.error("Error al cargar perfiles prioritarios:", error);
      throw error; // Propagar el error para manejarlo en searchPlayers
    }
  };

  // Función para cargar perfiles regulares (para paginación después de la primera página)
  const loadRegularProfiles = async (currentToken: string) => {
    try {
      // Si tenemos amateurs precargados, usarlos para paginación
      if (allPlayersLoaded.length > 0) {
        const PAGE_SIZE = 20; // Reducido de 30 a 20 para usar menos memoria
        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const nextBatch = allPlayersLoaded.slice(start, end);

        if (nextBatch.length > 0) {
          setPlayers((prev) => {
  const updatedPlayers = [...prev, ...nextBatch];

  requestAnimationFrame(() => {
    window.scrollTo({
      top: scrollPositionRef.current,
      behavior: "auto",
    });
  });

  return updatedPlayers;
});
          return;
        }
      }

      // Si no hay suficientes amateurs precargados, cargar más del servidor
      const PAGE_SIZE = 30; // Reducido de 50 a 30 para usar menos memoria
      const params = buildSearchParams();
      params.append("limit", String(PAGE_SIZE));
      params.append("offset", String(page * PAGE_SIZE));

      console.log("Cargando más perfiles...");

      const response = await axios.get(
        `${getApiUrl()}/user/search/users?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      const newUsers = response.data.users || [];

      // Añadir nuevos usuarios a la lista existente
      setPlayers((prev) => {
  const updatedPlayers = [...prev, ...newUsers];

  requestAnimationFrame(() => {
    window.scrollTo({
      top: scrollPositionRef.current,
      behavior: "auto",
    });
  });

  return updatedPlayers;
});
    } catch (error) {
      console.error("Error al cargar más perfiles:", error);
      throw error;
    }
  };

  // Función para construir parámetros de búsqueda comunes
  const buildSearchParams = () => {
    const params = new URLSearchParams();

    // Añadir filtros de búsqueda si existen
    if (searchQuery) {
      // Verificar si la búsqueda es por posición
      const positionMatch = positions.find((pos) =>
        searchQuery.toLowerCase().includes(pos.toLowerCase())
      );

      // Si coincide con una posición, buscar por posición
      if (positionMatch) {
        params.append("primaryPosition", positionMatch);
      }
      // De lo contrario, buscar por nombre
      else {
        params.append("name", searchQuery);
      }
    }

    // Añadir filtros adicionales si están seleccionados en el formulario
    if (filters.primaryPosition) {
      params.append("primaryPosition", filters.primaryPosition);
    }

    if (filters.nationality) {
      params.append("nationality", filters.nationality);
    }

    if (filters.minAge) {
      params.append("minAge", filters.minAge.toString());
    }

    if (filters.maxAge) {
      params.append("maxAge", filters.maxAge.toString());
    }

    if (filters.minHeight) {
      params.append("minHeight", filters.minHeight.toString());
    }

    if (filters.maxHeight) {
      params.append("maxHeight", filters.maxHeight.toString());
    }

    if (filters.skillfulFoot) {
      params.append("skillfulFoot", filters.skillfulFoot);
    }

    if (filters.role) {
      params.append("role", filters.role);
    }

    return params;
  };

  // Función para ordenar usuarios por tipo de suscripción y rol
  const sortPlayersBySubscriptionType = (users: User[]): User[] => {
    return [...users].sort((a, b) => {
      // Función auxiliar para verificar si el usuario tiene una suscripción específica
      const hasSubscription = (
        user: User,
        subscriptionName: string
      ): boolean => {
        return (
          user.subscriptionType === subscriptionName ||
          user.subscription === subscriptionName
        );
      };

      // Función auxiliar para verificar si el usuario es profesional
      const isProfessional = (user: User): boolean => {
        return (
          hasSubscription(user, "Profesional") ||
          hasSubscription(user, "profesional") ||
          hasSubscription(user, "Professional")
        );
      };

      // Función auxiliar para verificar si el usuario es semiprofesional
      const isSemiProfessional = (user: User): boolean => {
        return (
          hasSubscription(user, "Semiprofesional") ||
          hasSubscription(user, "semiprofesional") ||
          hasSubscription(user, "Semi-profesional")
        );
      };

      // Determinar prioridad por rol y tipo de suscripción
      const getPriority = (user: User): number => {
        // Reclutadores tienen prioridad alta
        if (user.role === "RECRUITER") return 1;

        // Jugadores profesionales
        if (user.role === "PLAYER" && isProfessional(user)) return 2;

        // Jugadores semiprofesionales
        if (user.role === "PLAYER" && isSemiProfessional(user)) return 3;

        // Jugadores amateur o cualquier otro caso
        return 4;
      };

      const priorityA = getPriority(a);
      const priorityB = getPriority(b);

      // Ordenar por prioridad
      return priorityA - priorityB;
    });
  };

  // Manejadores de eventos
  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);

    // Búsqueda en tiempo real después de una pausa
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPage(0); // Resetear a la primera página
      searchPlayers(); // Ejecutar la búsqueda
    }, 500); // Esperar 500ms después de que el usuario deje de escribir
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [name]: value,
      };

      // Si se selecciona "Solo reclutadores/agencias", limpiar filtros que no aplican
      if (name === "role" && value === "RECRUITER") {
        newFilters.primaryPosition = "";
        newFilters.subscriptionType = "";
      }

      return newFilters;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // Resetear paginación
    searchPlayers();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Efecto para buscar cuando cambia la página
  useEffect(() => {
    if (typeof window !== "undefined" && user && token) {
      let isMounted = true;
      const abortController = new AbortController();

      if (isMounted) {
        searchPlayers();
      }

      return () => {
        isMounted = false;
        abortController.abort();
      };
    }
  }, [page, user, token]);

  // Efecto para buscar cuando cambia el filtro de rol
  useEffect(() => {
    if (typeof window !== "undefined" && user && token) {
      let isMounted = true;
      const abortController = new AbortController();

      if (isMounted) {
        setPage(0); // Resetear a la primera página
        searchPlayers();
      }

      return () => {
        isMounted = false;
        abortController.abort();
      };
    }
  }, [filters.role, user, token]);

  // Efecto para forzar re-renderizado cuando cambie el filtro de suscripción
  useEffect(() => {
    // Este efecto solo fuerza el re-renderizado del componente
    // El filtro se aplica en tiempo real en el renderizado
  }, [filters.subscriptionType]);

  // Función para aplicar filtros del lado del cliente
  const applyClientSideFilters = (users: User[]): User[] => {
    return users.filter((currentUser) => {
      // Filtrar por tipo de suscripción
      if (filters.subscriptionType) {
        // Función auxiliar para verificar si el usuario tiene una suscripción específica
        // Verifica tanto el campo 'subscriptionType' como 'subscription' para mayor compatibilidad
        const hasSubscription = (subscriptionName: string): boolean => {
          return (
            currentUser.subscriptionType === subscriptionName ||
            currentUser.subscription === subscriptionName
          );
        };

        // Función auxiliar para verificar si el usuario es profesional
        const isProfessional = (): boolean => {
          return (
            hasSubscription("Profesional") ||
            hasSubscription("profesional") ||
            hasSubscription("Professional")
          );
        };

        // Función auxiliar para verificar si el usuario es semiprofesional
        const isSemiProfessional = (): boolean => {
          return (
            hasSubscription("Semiprofesional") ||
            hasSubscription("semiprofesional") ||
            hasSubscription("Semi-profesional")
          );
        };

        // Función auxiliar para verificar si el usuario es amateur
        const isAmateur = (): boolean => {
          return !isProfessional() && !isSemiProfessional();
        };

        switch (filters.subscriptionType) {
          case "Profesional":
            return isProfessional();
          case "Semiprofesional":
            return isSemiProfessional();
          case "premium":
            return isProfessional() || isSemiProfessional();
          case "amateur":
            return isAmateur();
          default:
            return true;
        }
      }

      return true;
    });
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
    setPage(0);
    searchPlayers();
  };

  // Función para cargar más jugadores
const loadMorePlayers = () => {
  scrollPositionRef.current = window.scrollY;
  setPage((prevPage) => prevPage + 1);
};

  // Función para enviar solicitud de representación
  const handleAddToPortfolio = async (playerId: string) => {
    const currentToken = await verifyToken();
    if (!currentToken || !user) {
      toast.error(t("needLogin"));
      return;
    }

    try {
      setIsAddingToPortfolio(playerId);
      console.log(
        `Intentando enviar solicitud de representación al jugador ${playerId} desde el reclutador ${user.id}`
      );
      console.log(`URL: ${getApiUrl()}/user/${user.id}/representation-request`);
      console.log(`Token disponible: ${!!currentToken}`);

      // Mostrar un diálogo para que el reclutador pueda escribir un mensaje
      const message = window.prompt(
        "Escribe un mensaje para el jugador explicando por qué quieres representarlo:"
      );

      // Si el usuario cancela el prompt, no enviamos la solicitud
      if (message === null) {
        setIsAddingToPortfolio(null);
        return;
      }

      const response = await axios.post(
        `${getApiUrl()}/user/${user.id}/representation-request`,
        {
          playerId,
          message: message || "Me gustaría representarte como agente.",
        },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Respuesta del servidor:", response.data);
      toast.success("Solicitud de representación enviada correctamente");
    } catch (error: any) {
      console.error("Error al enviar solicitud de representación:", error);
      if (error.response) {
        // El servidor respondió con un código de estado diferente de 2xx
        console.error("Datos de la respuesta de error:", error.response.data);
        console.error("Estado HTTP:", error.response.status);
        console.error("Cabeceras:", error.response.headers);

        // Mostrar mensaje de error específico si está disponible
        const errorMessage =
          error.response.data?.message ||
          "Error al enviar solicitud de representación";
        toast.error(errorMessage);
      } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        console.error("No se recibió respuesta del servidor");
        toast.error("No se pudo conectar con el servidor");
      } else {
        // Algo sucedió al configurar la solicitud
        console.error("Error al configurar la solicitud:", error.message);
        toast.error("Error al procesar la solicitud");
      }
    } finally {
      setIsAddingToPortfolio(null);
    }
  };

  // Renderizar tarjeta de usuario
  const renderUserCard = (currentUser: User) => {
    return (
      <UserCard
        currentUser={currentUser}
        t={t}
        isAddingToPortfolio={isAddingToPortfolio}
        handleAddToPortfolio={handleAddToPortfolio}
        key={currentUser.id}
      />
    );
  };

  return (
  <div className="min-h-screen bg-white">
    <div className="px-6 py-10 md:px-8 md:py-12 max-w-[1440px] mx-auto">
<div className="mb-10">
  <h1 className="text-4xl font-bold text-slate-900">
    Mercado de profesionales.
  </h1>

  <p className="mt-3 max-w-3xl text-base text-slate-500">
    Explorá jugadores, entrenadores, agencias y reclutadores utilizando filtros
    avanzados para encontrar el perfil ideal.
  </p>
</div>

      {/* Formulario de búsqueda */}
      <div className="mb-12 rounded-[32px] border border-gray-200 bg-white shadow-md overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-8 py-6">
  <h2 className="text-lg font-semibold text-slate-900">
    Buscar profesionales
  </h2>

  <p className="mt-1 text-sm text-gray-500">
    Utilizá los filtros para encontrar el perfil ideal.
  </p>
</div>
        <form
  onSubmit={handleSubmit}
  className="p-8"
>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="searchQuery"
                  className="block mb-2 font-medium text-gray-600"
                >
                  {t("nameOrLastname")}
                </label>
                <input
                  type="text"
                  id="searchQuery"
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                  placeholder={t("searchByName")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#3e7b26] focus:ring-4 focus:ring-green-100 outline-none transition-all"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="positionFilter"
                  className="block mb-2 font-medium text-gray-600"
                >
                  Filtrar por posición
                </label>
                <select
                  id="positionFilter"
                  name="primaryPosition"
                  value={filters.primaryPosition || ""}
                  onChange={handleFilterChange}
                  disabled={filters.role === "RECRUITER"}
                  className={`w-full p-2 text-black border border-gray-200 rounded text-base ${
                    filters.role === "RECRUITER"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <option value="">Todas las posiciones</option>
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
                {filters.role === "RECRUITER" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Las agencias no tienen posición de juego
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="roleFilter"
                  className="block mb-2 font-medium text-gray-600"
                >
                  Tipo de usuario
                </label>
                <select
                  id="roleFilter"
                  name="role"
                  value={filters.role || ""}
                  onChange={handleFilterChange}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 focus:border-[#3e7b26] focus:ring-4 focus:ring-green-100 outline-none transition-all"
                >
                  <option value="">Todos los tipos</option>
                  <option value="PLAYER">Solo jugadores</option>
                  <option value="RECRUITER">Solo reclutadores/agencias</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="subscriptionFilter"
                  className="block mb-2 font-medium text-gray-600"
                >
                  Tipo de suscripción
                </label>
                <select
                  id="subscriptionFilter"
                  name="subscriptionType"
                  value={filters.subscriptionType || ""}
                  onChange={handleFilterChange}
                  disabled={filters.role === "RECRUITER"}
                  className={`w-full p-2 text-black border border-gray-200 rounded text-base ${
                    filters.role === "RECRUITER"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <option value="">Todos los tipos de suscripción</option>
                  <option value="Profesional">Solo profesionales</option>
                  <option value="Semiprofesional">
                    Solo semiprofesionales
                  </option>
                  <option value="premium">
                    Profesionales y semiprofesionales
                  </option>
                  <option value="amateur">Solo amateur</option>
                </select>
                {filters.role === "RECRUITER" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Las agencias no tienen tipos de suscripción de jugador
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-[#3e7b26] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#34671f] hover:shadow-md active:scale-[0.98] w-full md:w-auto"
              >
                {t("search")}
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] w-full md:w-auto"
              >
                {t("clearFilters")}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Resultados de búsqueda */}
      {loading ? (
        <div className="text-center py-8">
          <p>{t("loading")}</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            {(() => {
              const filteredPlayers = applyClientSideFilters(players);
              return (
                <>
                  <p>
                    {t("showingResults", {
                      showing: filteredPlayers.length,
                      total: totalPlayers,
                    })}
                  </p>

                  {/* Etiquetas de filtros activos */}
                  {(filters.role ||
                    filters.subscriptionType ||
                    filters.primaryPosition) && (
                    <div className="mt-2 mb-3 flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500">
                        Filtros activos:
                      </span>
                      {filters.role && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {filters.role === "PLAYER"
                            ? "Solo jugadores"
                            : "Solo agencias"}
                          <button
                            type="button"
                            onClick={() =>
                              setFilters((prev) => ({ ...prev, role: "" }))
                            }
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {filters.subscriptionType && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {filters.subscriptionType === "Profesional"
                            ? "Profesionales"
                            : filters.subscriptionType === "Semiprofesional"
                            ? "Semiprofesionales"
                            : filters.subscriptionType === "premium"
                            ? "Premium (Pro + Semi)"
                            : "Amateur"}
                          <button
                            type="button"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                subscriptionType: "",
                              }))
                            }
                            className="ml-1 text-orange-600 hover:text-orange-800"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {filters.primaryPosition && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {filters.primaryPosition}
                          <button
                            type="button"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                primaryPosition: "",
                              }))
                            }
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  )}

                  {filteredPlayers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(() => {
                        const playersCount = filteredPlayers.filter(
                          (p) => p.role === "PLAYER"
                        ).length;
                        const recruitersCount = filteredPlayers.filter(
                          (p) => p.role === "RECRUITER"
                        ).length;
                        return (
                          <>
                            {playersCount > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                {playersCount}{" "}
                                {playersCount === 1 ? "jugador" : "jugadores"}
                              </span>
                            )}
                            {recruitersCount > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                                {recruitersCount}{" "}
                                {recruitersCount === 1 ? "agencia" : "agencias"}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {(() => {
              const filteredPlayers = applyClientSideFilters(players);
              return filteredPlayers.length > 0 ? (
                filteredPlayers.map((player) => renderUserCard(player))
              ) : (
                <p className="text-center py-8 text-gray-600 italic col-span-full">
                  {t("noPlayersFound")}
                </p>
              );
            })()}
          </div>

          {/* Botón para cargar más jugadores */}
          <div className="flex justify-center items-center gap-2 mt-8">
<button
  type="button"
  onClick={() => {
    if (page > 0) {
      setPlayers([]);
      setPage((prev) => prev - 1);
    }
  }}
  className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
  disabled={page === 0}
>
  ← Anterior
</button>

  <span className="px-4 py-2 rounded-xl bg-[#3e7b26] text-white font-medium">
    {page + 1}
  </span>

  <button
  type="button"
  onClick={() => {
    setPlayers([]);
    setPage((prev) => prev + 1);
  }}
  className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
>
  Siguiente →
</button>
</div>
          {(() => {
            const filteredPlayers = applyClientSideFilters(players);
            return (
              players.length < totalPlayers && (
                <div className="flex justify-center mt-4 mb-6">
                  <button
  onClick={loadMorePlayers}
  disabled={loading}
  className="group inline-flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-8 py-4 text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3e7b26] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
>
  <span className="text-xl transition-transform group-hover:translate-y-1">
    ↓
  </span>

  <span className="font-medium">
    {loading ? "Cargando perfiles..." : "Mostrar más perfiles"}
  </span>
</button>
                  {filters.subscriptionType && (
                    <p className="text-xs text-gray-500 ml-2 self-center">
                      Los nuevos resultados se filtrarán automáticamente
                    </p>
                  )}
                </div>
              )
            );
          })()}
        </>
      )}
    </div>
  </div>
  );
};


export default PlayerSearch;
