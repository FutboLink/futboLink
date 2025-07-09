"use client";

import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '../Context/UserContext';
import TranslationContext from '../Context/TranslationContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getDefaultPlayerImage } from '@/helpers/imageUtils';
import { renderCountryFlag } from '../countryFlag/countryFlag';

interface User {
  id: string;
  name: string;
  lastname: string;
  imgUrl?: string;
  age?: number;
  nationality?: string;
  primaryPosition?: string;
  secondaryPosition?: string;
  height?: number;
  weight?: number;
  skillfulFoot?: string;
  subscriptionType?: string;
  subscription?: string;
  role?: string;
  email?: string;
  phone?: string;
  ubicacionActual?: string;
}

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
  const { user, token } = useContext(UserContext);
  const { setLanguage, currentLanguage, isTranslateReady, isTranslating, getLanguageName } = useContext(TranslationContext);
  const router = useRouter();
  
  // Referencia al timeout para búsqueda en tiempo real
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Función de traducción simple
  const t = (key: string, params?: Record<string, any>): string => {
    // Implementación básica de traducción
    const translations: Record<string, string> = {
      // Mensajes generales
      needLogin: 'Necesitas iniciar sesión para acceder a esta función',
      needProfessionalSubscription: 'Necesitas una suscripción profesional para acceder a esta función',
      errorCheckingSubscription: 'Error al verificar tu suscripción',
      errorSearchingPlayers: 'Error al buscar usuarios',
      loading: 'Cargando...',
      noPlayersFound: 'No se encontraron usuarios con esos criterios',
      
      // Filtros
      playerSearch: 'Búsqueda de Jugadores y Agencias',
      showFilters: 'Mostrar filtros',
      hideFilters: 'Ocultar filtros',
      nameOrLastname: 'Nombre o apellido',
      searchByName: 'Buscar por nombre',
      position: 'Posición',
      allPositions: 'Todas las posiciones',
      nationality: 'Nacionalidad',
      allNationalities: 'Todas las nacionalidades',
      minAge: 'Edad mínima',
      maxAge: 'Edad máxima',
      minHeight: 'Altura mínima',
      maxHeight: 'Altura máxima',
      skillfulFoot: 'Pie hábil',
      any: 'Cualquiera',
      right: 'Derecho',
      left: 'Izquierdo',
      both: 'Ambos',
      search: 'Buscar',
      clearFilters: 'Limpiar filtros',
      profileType: 'Tipo de perfil',
      allProfiles: 'Todos los perfiles',
      userType: 'Tipo de usuario',
      allUserTypes: 'Todos los tipos',
      playersOnly: 'Solo jugadores',
      recruitersOnly: 'Solo reclutadores/agencias',
      
      // Tipos de perfil
      professional: 'Profesional',
      semi: 'Semi',
      amateur: 'Amateur',
      
      // Roles
      player: 'Jugador',
      recruiter: 'Reclutador/Agencia',
      
      // Información de jugador
      age: 'Edad',
      height: 'Altura',
      weight: 'Peso',
      notSpecified: 'No especificado',
      viewProfile: 'Ver perfil',
      birthdate: 'Fecha de nac.',
      location: 'Ubicación',
      email: 'Email',
      phone: 'Teléfono',
      
      // Paginación
      previous: 'Anterior',
      next: 'Siguiente',
      page: 'Página',
      of: 'de',
      showingResults: 'Mostrando {showing} de {total} resultados',
      featuredProfile: 'Perfil destacado',
      loadMore: 'Cargar más'
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
  const [searchQuery, setSearchQuery] = useState('');
  const [positions, setPositions] = useState<string[]>([
    'Portero', 
    'Defensor central', 
    'Lateral derecho', 
    'Lateral izquierdo', 
    'Mediocampista defensivo', 
    'Mediocampista central', 
    'Mediocampista ofensivo', 
    'Extremo derecho', 
    'Extremo izquierdo', 
    'Delantero centro'
  ]);
  // Mapa de términos comunes a posiciones oficiales
  const [positionAliases, setPositionAliases] = useState<Record<string, string>>({
    'delantero': 'Delantero centro',
    'defensa': 'Defensor central',
    'defensor': 'Defensor central',
    'mediocampista': 'Mediocampista central',
    'medio': 'Mediocampista central',
    'volante': 'Mediocampista central',
    'volante defensivo': 'Mediocampista defensivo',
    'volante ofensivo': 'Mediocampista ofensivo',
    'lateral': 'Lateral derecho',
    'arquero': 'Portero',
    'guardameta': 'Portero',
    'extremo': 'Extremo derecho',
    'atacante': 'Delantero centro',
    'central': 'Defensor central',
    'centrocampista': 'Mediocampista central',
    'zaguero': 'Defensor central',
    'punta': 'Delantero centro',
    'goleador': 'Delantero centro',
    'mediocentro': 'Mediocampista central',
    'mediocentro defensivo': 'Mediocampista defensivo',
    'mediocentro ofensivo': 'Mediocampista ofensivo'
  });
  const [nationalities, setNationalities] = useState<string[]>([
    'Argentina', 'Brasil', 'España', 'Francia', 'Italia', 'Alemania',
    'Inglaterra', 'Portugal', 'Uruguay', 'Colombia', 'México', 'Chile'
  ]);
  const [profileTypes, setProfileTypes] = useState<string[]>([
    'professional', 'semi', 'amateur'
  ]);

  // Agregar estados para manejar la adición a la cartera a nivel del componente principal
  const [isAddingToPortfolio, setIsAddingToPortfolio] = useState<string | null>(null);

  // Agregar una función para obtener la URL de la API
  const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'https://futbolink.onrender.com';
  };

  // Verificar si el usuario tiene suscripción profesional
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!user || !token) {
      toast.error(t('needLogin'));
      router.push('/Login');
      return;
    }
    
    console.log('Token disponible:', !!token); // Verificar si el token existe
    
    // Permitir acceso a usuarios con rol RECRUITER sin verificar suscripción
    if (user.role === 'RECRUITER') {
      // Cargar jugadores iniciales directamente
      searchPlayers();
      return;
    }
    
    // Para otros roles, verificar tipo de suscripción
    axios.get(`${getApiUrl()}/user/${user.id}/subscription`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        const { subscriptionType, isActive } = response.data;
        if (subscriptionType !== 'Profesional' || !isActive) {
          toast.error(t('needProfessionalSubscription'));
          router.push('/Subs');
        } else {
          // Cargar jugadores iniciales
          searchPlayers();
        }
      })
      .catch(error => {
        console.error('Error al verificar suscripción:', error);
        toast.error(t('errorCheckingSubscription'));
        router.push('/');
      });
  }, [user, token, router]);

  // Agregar una función para verificar y refrescar el token
  const verifyToken = async (): Promise<string | null> => {
    if (!token) {
      console.error('No hay token disponible');
      toast.error(t('needLogin'));
      router.push('/Login');
      return null;
    }
    
    // Verificar si el token está en localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      console.error('No hay datos de usuario en localStorage');
      toast.error(t('needLogin'));
      router.push('/Login');
      return null;
    }
    
    try {
      const parsedUserData = JSON.parse(userData);
      const localToken = parsedUserData.token;
      
      if (localToken && localToken !== token) {
        console.log('Usando token de localStorage');
        return localToken;
      }
      
      return token;
    } catch (error) {
      console.error('Error al parsear datos de usuario:', error);
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
      console.error('Error al buscar jugadores:', error);
      toast.error(t('errorSearchingPlayers'));
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cargar perfiles prioritarios (profesionales y semiprofesionales)
  const loadPriorityProfiles = async (currentToken: string) => {
    try {
      // Cargar perfiles en lotes más pequeños para evitar errores 400
      const BATCH_SIZE = 50; // Tamaño de lote que el backend acepta
      const MAX_BATCHES = 4; // Máximo número de lotes a cargar (hasta 200 perfiles)
      
      let allLoadedUsers: User[] = [];
      let hasMoreToLoad = true;
      let batchCount = 0;
      
      console.log('Cargando perfiles prioritarios...');
      console.log('Token usado para la petición:', currentToken ? 'Disponible' : 'No disponible');
      
      // Cargar perfiles en lotes hasta que no haya más o alcancemos el máximo
      while (hasMoreToLoad && batchCount < MAX_BATCHES) {
        const params = buildSearchParams();
        params.append('limit', String(BATCH_SIZE));
        params.append('offset', String(batchCount * BATCH_SIZE));
        
        console.log(`Cargando lote ${batchCount + 1}/${MAX_BATCHES}...`);
        
        try {
          const response = await axios.get(`${getApiUrl()}/user/search/users?${params.toString()}`, {
            headers: {
              Authorization: `Bearer ${currentToken}`
            }
          });
          
          const batchUsers = response.data.users || [];
          allLoadedUsers = [...allLoadedUsers, ...batchUsers];
          
          // Actualizar el total de jugadores disponibles
          setTotalPlayers(response.data.total || 0);
          
          // Si recibimos menos usuarios de los solicitados, no hay más para cargar
          if (batchUsers.length < BATCH_SIZE) {
            hasMoreToLoad = false;
            console.log('No hay más perfiles para cargar');
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
      const hasSubscription = (user: User, subscriptionName: string): boolean => {
        return user.subscriptionType === subscriptionName || user.subscription === subscriptionName;
      };
      
      // Función auxiliar para verificar si el usuario es profesional
      const isProfessional = (user: User): boolean => {
        return hasSubscription(user, 'Profesional') || hasSubscription(user, 'profesional') || hasSubscription(user, 'Professional');
      };
      
      // Función auxiliar para verificar si el usuario es semiprofesional
      const isSemiProfessional = (user: User): boolean => {
        return hasSubscription(user, 'Semiprofesional') || hasSubscription(user, 'semiprofesional') || hasSubscription(user, 'Semi-profesional');
      };
      
      const professionalPlayers = sortedUsers.filter(user => 
        isProfessional(user) && user.role === 'PLAYER'
      );
      
      const semiProfessionalPlayers = sortedUsers.filter(user => 
        isSemiProfessional(user) && user.role === 'PLAYER'
      );
      
      const recruiters = sortedUsers.filter(user => 
        user.role === 'RECRUITER'
      );
      
      const amateurPlayers = sortedUsers.filter(user => 
        user.role === 'PLAYER' && !isProfessional(user) && !isSemiProfessional(user)
      );
      
      console.log(`Encontrados: ${professionalPlayers.length} profesionales, ${semiProfessionalPlayers.length} semi-profesionales, ${recruiters.length} reclutadores y ${amateurPlayers.length} amateurs`);
      
      // Guardar la lista de amateurs para cargar más tarde
      setAllPlayersLoaded(amateurPlayers);
      
      // Mostrar primero los profesionales, semiprofesionales y reclutadores
      setPlayers([...professionalPlayers, ...semiProfessionalPlayers, ...recruiters]);
      
      // Si no hay suficientes profesionales/semis/reclutadores para llenar la primera página,
      // cargar algunos amateurs para completar
      const priorityUsersCount = professionalPlayers.length + semiProfessionalPlayers.length + recruiters.length;
      if (priorityUsersCount < 50) {
        const amateursToShow = amateurPlayers.slice(0, 50 - priorityUsersCount);
        setPlayers(prev => [...prev, ...amateursToShow]);
        
        // Actualizar la lista de amateurs restantes
        setAllPlayersLoaded(amateurPlayers.slice(50 - priorityUsersCount));
      }
      
    } catch (error) {
      console.error('Error al cargar perfiles prioritarios:', error);
      throw error; // Propagar el error para manejarlo en searchPlayers
    }
  };
  
  // Función para cargar perfiles regulares (para paginación después de la primera página)
  const loadRegularProfiles = async (currentToken: string) => {
    try {
      // Si tenemos amateurs precargados, usarlos para paginación
      if (allPlayersLoaded.length > 0) {
        const start = (page - 1) * 50;
        const end = start + 50;
        const nextBatch = allPlayersLoaded.slice(start, end);
        
        if (nextBatch.length > 0) {
          setPlayers(prev => [...prev, ...nextBatch]);
          return;
        }
      }
      
      // Si no hay suficientes amateurs precargados, cargar más del servidor
      const params = buildSearchParams();
      params.append('limit', '50');
      params.append('offset', String(page * 50));
      
      console.log('Cargando más perfiles...');
      
      const response = await axios.get(`${getApiUrl()}/user/search/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });
      
      const newUsers = response.data.users || [];
      
      // Añadir nuevos usuarios a la lista existente
      setPlayers(prev => [...prev, ...newUsers]);
      
    } catch (error) {
      console.error('Error al cargar más perfiles:', error);
      throw error;
    }
  };
  
  // Función para construir parámetros de búsqueda comunes
  const buildSearchParams = () => {
    const params = new URLSearchParams();
    
    // Añadir filtros de búsqueda si existen
    if (searchQuery) {
      // Verificar si la búsqueda es por posición
      const positionMatch = positions.find(pos => 
        searchQuery.toLowerCase().includes(pos.toLowerCase())
      );
      
      // Si coincide con una posición, buscar por posición
      if (positionMatch) {
        params.append('primaryPosition', positionMatch);
      } 
      // De lo contrario, buscar por nombre
      else {
        params.append('name', searchQuery);
      }
    }
    
    // Añadir filtros adicionales si están seleccionados en el formulario
    if (filters.primaryPosition) {
      params.append('primaryPosition', filters.primaryPosition);
    }
    
    if (filters.nationality) {
      params.append('nationality', filters.nationality);
    }
    
    if (filters.minAge) {
      params.append('minAge', filters.minAge.toString());
    }
    
    if (filters.maxAge) {
      params.append('maxAge', filters.maxAge.toString());
    }
    
    if (filters.minHeight) {
      params.append('minHeight', filters.minHeight.toString());
    }
    
    if (filters.maxHeight) {
      params.append('maxHeight', filters.maxHeight.toString());
    }
    
    if (filters.skillfulFoot) {
      params.append('skillfulFoot', filters.skillfulFoot);
    }
    
    if (filters.role) {
      params.append('role', filters.role);
    }
    
    return params;
  };

  // Función para ordenar usuarios por tipo de suscripción y rol
  const sortPlayersBySubscriptionType = (users: User[]): User[] => {
    return [...users].sort((a, b) => {
      // Función auxiliar para verificar si el usuario tiene una suscripción específica
      const hasSubscription = (user: User, subscriptionName: string): boolean => {
        return user.subscriptionType === subscriptionName || user.subscription === subscriptionName;
      };
      
      // Función auxiliar para verificar si el usuario es profesional
      const isProfessional = (user: User): boolean => {
        return hasSubscription(user, 'Profesional') || hasSubscription(user, 'profesional') || hasSubscription(user, 'Professional');
      };
      
      // Función auxiliar para verificar si el usuario es semiprofesional
      const isSemiProfessional = (user: User): boolean => {
        return hasSubscription(user, 'Semiprofesional') || hasSubscription(user, 'semiprofesional') || hasSubscription(user, 'Semi-profesional');
      };
      
      // Determinar prioridad por rol y tipo de suscripción
      const getPriority = (user: User): number => {
        // Reclutadores tienen prioridad alta
        if (user.role === 'RECRUITER') return 1;
        
        // Jugadores profesionales
        if (user.role === 'PLAYER' && isProfessional(user)) return 2;
        
        // Jugadores semiprofesionales
        if (user.role === 'PLAYER' && isSemiProfessional(user)) return 3;
        
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const newFilters = {
      ...prev,
      [name]: value
      };
      
      // Si se selecciona "Solo reclutadores/agencias", limpiar filtros que no aplican
      if (name === 'role' && value === 'RECRUITER') {
        newFilters.primaryPosition = '';
        newFilters.subscriptionType = '';
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
    if (typeof window !== 'undefined' && user && token) {
      searchPlayers();
    }
  }, [page, user, token]);

  // Efecto para buscar cuando cambia el filtro de rol
  useEffect(() => {
    if (typeof window !== 'undefined' && user && token) {
      setPage(0); // Resetear a la primera página
      searchPlayers();
    }
  }, [filters.role, user, token]);

  // Efecto para forzar re-renderizado cuando cambie el filtro de suscripción
  useEffect(() => {
    // Este efecto solo fuerza el re-renderizado del componente
    // El filtro se aplica en tiempo real en el renderizado
  }, [filters.subscriptionType]);

  // Función para aplicar filtros del lado del cliente
  const applyClientSideFilters = (users: User[]): User[] => {
    return users.filter(currentUser => {
      // Filtrar por tipo de suscripción
      if (filters.subscriptionType) {
        // Función auxiliar para verificar si el usuario tiene una suscripción específica
        // Verifica tanto el campo 'subscriptionType' como 'subscription' para mayor compatibilidad
        const hasSubscription = (subscriptionName: string): boolean => {
          return currentUser.subscriptionType === subscriptionName || currentUser.subscription === subscriptionName;
        };
        
        // Función auxiliar para verificar si el usuario es profesional
        const isProfessional = (): boolean => {
          return hasSubscription('Profesional') || hasSubscription('profesional') || hasSubscription('Professional');
        };
        
        // Función auxiliar para verificar si el usuario es semiprofesional
        const isSemiProfessional = (): boolean => {
          return hasSubscription('Semiprofesional') || hasSubscription('semiprofesional') || hasSubscription('Semi-profesional');
        };
        
        // Función auxiliar para verificar si el usuario es amateur
        const isAmateur = (): boolean => {
          return !isProfessional() && !isSemiProfessional();
        };
        
        switch (filters.subscriptionType) {
          case 'Profesional':
            return isProfessional();
          case 'Semiprofesional':
            return isSemiProfessional();
          case 'premium':
            return isProfessional() || isSemiProfessional();
          case 'amateur':
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
    setSearchQuery('');
    setPage(0);
    searchPlayers();
  };

  // Función para cargar más jugadores
  const loadMorePlayers = () => {
    setPage(prevPage => prevPage + 1);
  };

  // Función para enviar solicitud de representación
  const handleAddToPortfolio = async (playerId: string) => {
    const currentToken = await verifyToken();
    if (!currentToken || !user) {
      toast.error(t('needLogin'));
      return;
    }
    
    try {
      setIsAddingToPortfolio(playerId);
      console.log(`Intentando enviar solicitud de representación al jugador ${playerId} desde el reclutador ${user.id}`);
      console.log(`URL: ${getApiUrl()}/user/${user.id}/representation-request`);
      console.log(`Token disponible: ${!!currentToken}`);
      
      // Mostrar un diálogo para que el reclutador pueda escribir un mensaje
      const message = window.prompt('Escribe un mensaje para el jugador explicando por qué quieres representarlo:');
      
      // Si el usuario cancela el prompt, no enviamos la solicitud
      if (message === null) {
        setIsAddingToPortfolio(null);
        return;
      }
      
      const response = await axios.post(
        `${getApiUrl()}/user/${user.id}/representation-request`,
        { 
          playerId,
          message: message || 'Me gustaría representarte como agente.' 
        },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Respuesta del servidor:', response.data);
      toast.success('Solicitud de representación enviada correctamente');
    } catch (error: any) {
      console.error('Error al enviar solicitud de representación:', error);
      if (error.response) {
        // El servidor respondió con un código de estado diferente de 2xx
        console.error('Datos de la respuesta de error:', error.response.data);
        console.error('Estado HTTP:', error.response.status);
        console.error('Cabeceras:', error.response.headers);
        
        // Mostrar mensaje de error específico si está disponible
        const errorMessage = error.response.data?.message || 'Error al enviar solicitud de representación';
        toast.error(errorMessage);
      } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        console.error('No se recibió respuesta del servidor');
        toast.error('No se pudo conectar con el servidor');
      } else {
        // Algo sucedió al configurar la solicitud
        console.error('Error al configurar la solicitud:', error.message);
        toast.error('Error al procesar la solicitud');
      }
    } finally {
      setIsAddingToPortfolio(null);
    }
  };

  // Renderizar tarjeta de usuario
  const renderUserCard = (currentUser: User) => {
    const isPlayer = currentUser.role === 'PLAYER';
    const isRecruiter = currentUser.role === 'RECRUITER';
    
    // Función auxiliar para verificar si el usuario tiene una suscripción específica
    const hasSubscription = (subscriptionName: string): boolean => {
      return currentUser.subscriptionType === subscriptionName || currentUser.subscription === subscriptionName;
    };
    
    // Determinar tipo de suscripción usando ambos campos: subscriptionType y subscription
    const subscriptionType = (() => {
      if (hasSubscription('Profesional') || hasSubscription('profesional') || hasSubscription('Professional')) {
        return 'professional';
      }
      if (hasSubscription('Semiprofesional') || hasSubscription('semiprofesional') || hasSubscription('Semi-profesional')) {
        return 'semi';
      }
      return 'amateur';
    })();
    
    // Color de la insignia según tipo de suscripción o rol
    const badgeBgClass = isRecruiter 
      ? 'bg-purple-800'
      : {
      'professional': 'bg-green-800',
      'semi': 'bg-blue-700',
      'amateur': 'bg-gray-700'
    }[subscriptionType];
    
    // Texto de la insignia según tipo de suscripción o rol
    const badgeText = isRecruiter 
      ? t('recruiter')
      : {
      'professional': t('professional'),
      'semi': t('semi'),
      'amateur': t('amateur')
    }[subscriptionType];
    
    // Verificar si este usuario está siendo añadido a la cartera
    const isBeingAddedToPortfolio = isAddingToPortfolio === currentUser.id;
    
    return (
      <div key={currentUser.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all relative">
        {/* Imagen de fondo/header */}
        <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 relative overflow-hidden">
          {/* Imagen de fondo (misma que la de perfil) */}
          {currentUser.imgUrl && (
            <div className="absolute inset-0">
              <Image 
                src={currentUser.imgUrl} 
                alt=""
                fill
                className="object-cover blur-[1px]"
              />
              {/* Overlay para oscurecer la imagen */}
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          )}
          
          {/* Gradiente decorativo si no hay imagen */}
          {!currentUser.imgUrl && (
            <div className={`absolute inset-0 bg-gradient-to-r ${
              isRecruiter ? 'from-purple-800 to-purple-600' :
              subscriptionType === 'professional' ? 'from-green-800 to-green-600' :
              subscriptionType === 'semi' ? 'from-blue-700 to-blue-500' :
              'from-gray-700 to-gray-500'
            }`}></div>
          )}
        </div>
        
        {/* Contenido principal */}
        <div className="px-4 pb-4 pt-12 relative">
          {/* Foto de perfil */}
          <div className="absolute -top-10 left-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md">
                <Image 
                  src={currentUser.imgUrl || getDefaultPlayerImage()} 
                  alt={`${currentUser.name} ${currentUser.lastname}`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              
              {/* Indicador de tipo de suscripción */}
              <div className={`absolute -right-1 -bottom-1 ${badgeBgClass} text-white text-xs py-0.5 px-2 rounded-full font-medium shadow-sm`}>
                <span>{badgeText}</span>
              </div>
            </div>
          </div>
          
          {/* Nombre y información */}
          <div className="mb-2">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{currentUser.name} {currentUser.lastname}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {isPlayer && (
                <>
                  {currentUser.primaryPosition || t('notSpecified')}
                  {currentUser.secondaryPosition && ` / ${currentUser.secondaryPosition}`}
                </>
              )}
              {isRecruiter && (
                <>
                  {t('recruiter')}
                  {currentUser.ubicacionActual && ` - ${currentUser.ubicacionActual}`}
                </>
              )}
              {currentUser.nationality && ` | ${currentUser.nationality}`}
            </p>
          </div>
          
          {/* Detalles adicionales */}
          <div className="text-xs text-gray-500 space-y-1 mb-4">
            {isPlayer && (
              <>
                {currentUser.age && (
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                    <span>{t('age')}: {currentUser.age}</span>
              </div>
            )}
            
                {currentUser.height && (
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                    <span>{t('height')}: {currentUser.height} cm</span>
              </div>
            )}
            
                {currentUser.skillfulFoot && (
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                    <span>{t('skillfulFoot')}: {currentUser.skillfulFoot}</span>
              </div>
                )}
              </>
            )}
            
            {isRecruiter && (
              <>
                <div className="bg-yellow-50 border border-yellow-100 rounded p-1 mb-1">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6v4m0-8v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-yellow-700">Contacto no disponible con tu suscripción</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate text-gray-400">●●●●●●●●</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-400">●●●●●●●●</span>
                </div>
              </>
            )}
            
            {/* Nacionalidad con bandera */}
            {currentUser.nationality && (
              <div className="flex items-center gap-1">
                <span className="flex items-center">
                  {renderCountryFlag(currentUser.nationality)}
                </span>
                <span>{currentUser.nationality}</span>
              </div>
            )}
          </div>
          
          {/* Botones de acción */}
          <div className="flex flex-col space-y-2">
            {/* Botón de ver perfil */}
            <Link 
              href={`/user-viewer/${currentUser.id}`} 
              className={`flex items-center justify-center w-full py-1.5 px-3 border rounded-full text-sm font-medium transition-colors ${
                isRecruiter 
                ? "border-purple-600 text-purple-600 hover:bg-purple-50" 
                : "border-blue-600 text-blue-600 hover:bg-blue-50"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              {t('viewProfile')}
            </Link>
            
            {/* Botón de añadir a cartera (solo visible para reclutadores y para jugadores) */}
            {user && user.role === 'RECRUITER' && isPlayer && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToPortfolio(currentUser.id);
                }}
                disabled={isBeingAddedToPortfolio}
                className="flex items-center justify-center w-full py-1.5 px-3 border border-green-600 text-green-600 rounded-full text-sm font-medium hover:bg-green-50 transition-colors"
              >
                {isBeingAddedToPortfolio ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Enviar solicitud
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="mb-6 text-blue-900 text-center">{t('playerSearch')}</h1>
      
      {/* Información sobre los tipos de usuario */}
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Puedes buscar tanto <strong>jugadores</strong> como <strong>reclutadores/agencias</strong>. Usa los filtros disponibles para encontrar específicamente lo que buscas:
        </p>
        <ul className="text-xs text-blue-700 mt-2 ml-5 space-y-1">
          <li>• <strong>Tipo de usuario:</strong> Filtra entre jugadores y agencias</li>
          <li>• <strong>Tipo de suscripción:</strong> Encuentra jugadores profesionales, semiprofesionales o amateur (detecta automáticamente el tipo de suscripción)</li>
          <li>• <strong>Posición:</strong> Busca jugadores por su posición en el campo</li>
        </ul>
      </div>
      
      {/* Formulario de búsqueda */}
      <div className="mb-8 bg-gray-50 rounded-lg p-4 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="searchQuery" className="block mb-2 font-medium text-gray-600">{t('nameOrLastname')}</label>
                <input
                  type="text"
                  id="searchQuery"
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                  placeholder={t('searchByName')}
                  className="w-full p-2 border text-black border-gray-200 rounded text-base"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="positionFilter" className="block mb-2 font-medium text-gray-600">Filtrar por posición</label>
                <select
                  id="positionFilter"
                  name="primaryPosition"
                  value={filters.primaryPosition || ''}
                  onChange={handleFilterChange}
                  disabled={filters.role === 'RECRUITER'}
                  className={`w-full p-2 text-black border border-gray-200 rounded text-base ${
                    filters.role === 'RECRUITER' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Todas las posiciones</option>
                  {positions.map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
                {filters.role === 'RECRUITER' && (
                  <p className="text-xs text-gray-500 mt-1">Las agencias no tienen posición de juego</p>
                )}
              </div>
              <div className="flex-1">
                <label htmlFor="roleFilter" className="block mb-2 font-medium text-gray-600">Tipo de usuario</label>
                <select
                  id="roleFilter"
                  name="role"
                  value={filters.role || ''}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-black border border-gray-200 rounded text-base"
                >
                  <option value="">Todos los tipos</option>
                  <option value="PLAYER">Solo jugadores</option>
                  <option value="RECRUITER">Solo reclutadores/agencias</option>
                </select>
            </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="subscriptionFilter" className="block mb-2 font-medium text-gray-600">Tipo de suscripción</label>
                <select
                  id="subscriptionFilter"
                  name="subscriptionType"
                  value={filters.subscriptionType || ''}
                  onChange={handleFilterChange}
                  disabled={filters.role === 'RECRUITER'}
                  className={`w-full p-2 text-black border border-gray-200 rounded text-base ${
                    filters.role === 'RECRUITER' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Todos los tipos de suscripción</option>
                  <option value="Profesional">Solo profesionales</option>
                  <option value="Semiprofesional">Solo semiprofesionales</option>
                  <option value="premium">Profesionales y semiprofesionales</option>
                  <option value="amateur">Solo amateur</option>
                </select>
                {filters.role === 'RECRUITER' && (
                  <p className="text-xs text-gray-500 mt-1">Las agencias no tienen tipos de suscripción de jugador</p>
                )}
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button 
                type="submit" 
                className="bg-green-800 text-white border-none py-2 px-8 rounded font-medium hover:bg-green-700 transition-colors w-full md:w-auto"
              >
                {t('search')}
              </button>
              <button 
                type="button"
                onClick={clearFilters}
                className="bg-gray-500 text-white border-none py-2 px-8 rounded font-medium hover:bg-gray-600 transition-colors w-full md:w-auto"
              >
                {t('clearFilters')}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Resultados de búsqueda */}
      {loading ? (
        <div className="text-center py-8">
          <p>{t('loading')}</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            {(() => {
              const filteredPlayers = applyClientSideFilters(players);
              return (
                <>
                  <p>{t('showingResults', { showing: filteredPlayers.length, total: totalPlayers })}</p>
                  
                  {/* Etiquetas de filtros activos */}
                  {(filters.role || filters.subscriptionType || filters.primaryPosition) && (
                    <div className="mt-2 mb-3 flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500">Filtros activos:</span>
                      {filters.role && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {filters.role === 'PLAYER' ? 'Solo jugadores' : 'Solo agencias'}
                          <button
                            onClick={() => setFilters(prev => ({ ...prev, role: '' }))}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {filters.subscriptionType && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {filters.subscriptionType === 'Profesional' ? 'Profesionales' :
                           filters.subscriptionType === 'Semiprofesional' ? 'Semiprofesionales' :
                           filters.subscriptionType === 'premium' ? 'Premium (Pro + Semi)' : 'Amateur'}
                          <button
                            onClick={() => setFilters(prev => ({ ...prev, subscriptionType: '' }))}
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
                            onClick={() => setFilters(prev => ({ ...prev, primaryPosition: '' }))}
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
                        const playersCount = filteredPlayers.filter(p => p.role === 'PLAYER').length;
                        const recruitersCount = filteredPlayers.filter(p => p.role === 'RECRUITER').length;
                        return (
                          <>
                            {playersCount > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {playersCount} {playersCount === 1 ? 'jugador' : 'jugadores'}
                              </span>
                            )}
                            {recruitersCount > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {recruitersCount} {recruitersCount === 1 ? 'agencia' : 'agencias'}
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
                filteredPlayers.map(player => renderUserCard(player))
            ) : (
              <p className="text-center py-8 text-gray-600 italic col-span-full">{t('noPlayersFound')}</p>
              );
            })()}
          </div>
          
          {/* Botón para cargar más jugadores */}
          {(() => {
            const filteredPlayers = applyClientSideFilters(players);
            return players.length < totalPlayers && (
            <div className="flex justify-center mt-4 mb-6">
              <button
                onClick={loadMorePlayers}
                className="bg-green-800 text-white border-none py-2 px-4 rounded transition-colors hover:bg-green-700"
                disabled={loading}
              >
                {loading ? t('loading') : t('loadMore')}
              </button>
                {filters.subscriptionType && (
                  <p className="text-xs text-gray-500 ml-2 self-center">
                    Los nuevos resultados se filtrarán automáticamente
                  </p>
          )}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
};

export default PlayerSearch; 