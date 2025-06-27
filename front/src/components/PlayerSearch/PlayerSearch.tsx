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

interface Player {
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
      errorSearchingPlayers: 'Error al buscar jugadores',
      loading: 'Cargando...',
      noPlayersFound: 'No se encontraron jugadores con esos criterios',
      
      // Filtros
      playerSearch: 'Búsqueda de Jugadores',
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
      
      // Tipos de perfil
      professional: 'Profesional',
      semi: 'Semi',
      amateur: 'Amateur',
      
      // Información de jugador
      age: 'Edad',
      height: 'Altura',
      weight: 'Peso',
      notSpecified: 'No especificado',
      viewProfile: 'Ver perfil',
      birthdate: 'Fecha de nac.',
      
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
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [allPlayersLoaded, setAllPlayersLoaded] = useState<Player[]>([]);
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

  // Verificar si el usuario tiene suscripción profesional
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!user || !token) {
      toast.error(t('needLogin'));
      router.push('/Login');
      return;
    }
    
    // Verificar tipo de suscripción
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}/subscription`)
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

  // Función para buscar jugadores
  const searchPlayers = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      // Si estamos en la primera página, necesitamos cargar primero todos los profesionales y semiprofesionales
      if (page === 0) {
        await loadPriorityProfiles();
        return;
      }
      
      // Para páginas posteriores, cargar normalmente
      await loadRegularProfiles();
      
    } catch (error) {
      console.error('Error al buscar jugadores:', error);
      toast.error(t('errorSearchingPlayers'));
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cargar perfiles prioritarios (profesionales y semiprofesionales)
  const loadPriorityProfiles = async () => {
    try {
      // Cargar perfiles en lotes más pequeños para evitar errores 400
      const BATCH_SIZE = 50; // Tamaño de lote que el backend acepta
      const MAX_BATCHES = 4; // Máximo número de lotes a cargar (hasta 200 perfiles)
      
      let allLoadedPlayers: Player[] = [];
      let hasMoreToLoad = true;
      let batchCount = 0;
      
      console.log('Cargando perfiles prioritarios...');
      
      // Cargar perfiles en lotes hasta que no haya más o alcancemos el máximo
      while (hasMoreToLoad && batchCount < MAX_BATCHES) {
        const params = buildSearchParams();
        params.append('limit', String(BATCH_SIZE));
        params.append('offset', String(batchCount * BATCH_SIZE));
        
        console.log(`Cargando lote ${batchCount + 1}/${MAX_BATCHES}...`);
        
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/search/players?${params.toString()}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          const batchPlayers = response.data.players || [];
          allLoadedPlayers = [...allLoadedPlayers, ...batchPlayers];
          
          // Actualizar el total de jugadores disponibles
          setTotalPlayers(response.data.total || 0);
          
          // Si recibimos menos jugadores de los solicitados, no hay más para cargar
          if (batchPlayers.length < BATCH_SIZE) {
            hasMoreToLoad = false;
            console.log('No hay más perfiles para cargar');
          }
          
          batchCount++;
          
        } catch (error) {
          console.error(`Error al cargar lote ${batchCount + 1}:`, error);
          hasMoreToLoad = false; // Detener la carga en caso de error
        }
      }
      
      // Filtrar y ordenar jugadores por tipo de suscripción
      const sortedPlayers = sortPlayersBySubscriptionType(allLoadedPlayers);
      
      // Separar jugadores por tipo de suscripción
      const professionalPlayers = sortedPlayers.filter(player => 
        player.subscriptionType === 'Profesional'
      );
      
      const semiProfessionalPlayers = sortedPlayers.filter(player => 
        player.subscriptionType === 'Semiprofesional'
      );
      
      const amateurPlayers = sortedPlayers.filter(player => 
        player.subscriptionType !== 'Profesional' && player.subscriptionType !== 'Semiprofesional'
      );
      
      console.log(`Encontrados: ${professionalPlayers.length} profesionales, ${semiProfessionalPlayers.length} semi-profesionales y ${amateurPlayers.length} amateurs`);
      
      // Guardar la lista de amateurs para cargar más tarde
      setAllPlayersLoaded(amateurPlayers);
      
      // Mostrar primero los profesionales y semiprofesionales
      setPlayers([...professionalPlayers, ...semiProfessionalPlayers]);
      
      // Si no hay suficientes profesionales/semis para llenar la primera página,
      // cargar algunos amateurs para completar
      if (professionalPlayers.length + semiProfessionalPlayers.length < 50) {
        const amateursToShow = amateurPlayers.slice(0, 50 - (professionalPlayers.length + semiProfessionalPlayers.length));
        setPlayers(prev => [...prev, ...amateursToShow]);
        
        // Actualizar la lista de amateurs restantes
        setAllPlayersLoaded(amateurPlayers.slice(50 - (professionalPlayers.length + semiProfessionalPlayers.length)));
      }
      
    } catch (error) {
      console.error('Error al cargar perfiles prioritarios:', error);
      throw error; // Propagar el error para manejarlo en searchPlayers
    }
  };
  
  // Función para cargar perfiles regulares (para paginación después de la primera página)
  const loadRegularProfiles = async () => {
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
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/search/players?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const newPlayers = response.data.players || [];
      
      // Añadir nuevos jugadores a la lista existente
      setPlayers(prev => [...prev, ...newPlayers]);
      
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
    
    return params;
  };

  // Función para ordenar jugadores por tipo de suscripción
  const sortPlayersBySubscriptionType = (players: Player[]): Player[] => {
    return [...players].sort((a, b) => {
      // Determinar tipo de suscripción para cada jugador
      const getSubscriptionType = (player: Player): number => {
        // Usar el campo subscriptionType directamente
        if (player.subscriptionType === 'Profesional') return 1;
        if (player.subscriptionType === 'Semiprofesional') return 2;
        // Amateur o cualquier otro caso
        return 3;
      };
      
      const typeA = getSubscriptionType(a);
      const typeB = getSubscriptionType(b);
      
      // Ordenar por tipo de suscripción (profesional y semiprofesional primero)
      return typeA - typeB;
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
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
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

  // Renderizar tarjeta de jugador
  const renderPlayerCard = (player: Player) => {
    // Determinar tipo de suscripción usando el campo subscriptionType
    const subscriptionType = player.subscriptionType === 'Profesional' 
      ? 'professional' 
      : (player.subscriptionType === 'Semiprofesional' ? 'semi' : 'amateur');
    
    // Color de la insignia según tipo de suscripción
    const badgeBgClass = {
      'professional': 'bg-green-800',
      'semi': 'bg-blue-700',
      'amateur': 'bg-gray-700'
    }[subscriptionType];
    
    // Texto de la insignia según tipo de suscripción
    const badgeText = {
      'professional': t('professional'),
      'semi': t('semi'),
      'amateur': t('amateur')
    }[subscriptionType];
    
    return (
      <div key={player.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all relative">
        {/* Imagen de fondo/header */}
        <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 relative overflow-hidden">
          {/* Imagen de fondo (misma que la de perfil) */}
          {player.imgUrl && (
            <div className="absolute inset-0">
              <Image 
                src={player.imgUrl} 
                alt=""
                fill
                className="object-cover blur-[1px]"
              />
              {/* Overlay para oscurecer la imagen */}
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          )}
          
          {/* Gradiente decorativo si no hay imagen */}
          {!player.imgUrl && (
            <div className={`absolute inset-0 bg-gradient-to-r ${
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
                  src={player.imgUrl || getDefaultPlayerImage()} 
                  alt={`${player.name} ${player.lastname}`}
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
          
          {/* Nombre y posición */}
          <div className="mb-2">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{player.name} {player.lastname}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {player.primaryPosition || t('notSpecified')}
              {player.secondaryPosition && ` / ${player.secondaryPosition}`}
              {player.nationality && ` | ${player.nationality}`}
            </p>
          </div>
          
          {/* Detalles adicionales */}
          <div className="text-xs text-gray-500 space-y-1 mb-4">
            {player.age && (
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{t('age')}: {player.age}</span>
              </div>
            )}
            
            {player.height && (
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>{t('height')}: {player.height} cm</span>
              </div>
            )}
            
            {player.skillfulFoot && (
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t('skillfulFoot')}: {player.skillfulFoot}</span>
              </div>
            )}
            
            {/* Nacionalidad con bandera */}
            {player.nationality && (
              <div className="flex items-center gap-1">
                <span className="flex items-center">
                  {renderCountryFlag(player.nationality)}
                </span>
                <span>{player.nationality}</span>
              </div>
            )}
          </div>
          
          {/* Botón de conexión */}
          <Link 
            href={`/user-viewer/${player.id}`} 
            className="flex items-center justify-center w-full py-1.5 px-3 border border-blue-600 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            {t('viewProfile')}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="mb-6 text-blue-900 text-center">{t('playerSearch')}</h1>
      
      {/* Formulario de búsqueda */}
      <div className="mb-8 bg-gray-50 rounded-lg p-4 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4 items-end">
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
                className="w-full p-2 text-black border border-gray-200 rounded text-base"
              >
                <option value="">Todas las posiciones</option>
                {positions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="bg-green-800 text-white border-none py-2 px-4 rounded font-medium hover:bg-green-700 transition-colors"
              >
                {t('search')}
              </button>
              <button 
                type="button" 
                onClick={clearFilters} 
                className="bg-gray-200 text-gray-600 border-none py-2 px-4 rounded font-medium hover:bg-gray-300 transition-colors"
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
            <p>{t('showingResults', { showing: players.length, total: totalPlayers })}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {players.length > 0 ? (
              players.map(player => renderPlayerCard(player))
            ) : (
              <p className="text-center py-8 text-gray-600 italic col-span-full">{t('noPlayersFound')}</p>
            )}
          </div>
          
          {/* Botón para cargar más jugadores */}
          {players.length < totalPlayers && (
            <div className="flex justify-center mt-4 mb-6">
              <button
                onClick={loadMorePlayers}
                className="bg-green-800 text-white border-none py-2 px-4 rounded transition-colors hover:bg-green-700"
                disabled={loading}
              >
                {loading ? t('loading') : t('loadMore')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PlayerSearch; 