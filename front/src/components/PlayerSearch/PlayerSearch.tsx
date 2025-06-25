"use client";

import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../Context/UserContext';
import TranslationContext from '../Context/TranslationContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../../Styles/playerSearch.module.css';
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
}

const PlayerSearch: React.FC = () => {
  const { user, token } = useContext(UserContext);
  const { setLanguage, currentLanguage, isTranslateReady, isTranslating, getLanguageName } = useContext(TranslationContext);
  const router = useRouter();
  
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
      
      // Información de jugador
      age: 'Edad',
      height: 'Altura',
      weight: 'Peso',
      notSpecified: 'No especificado',
      viewProfile: 'Ver perfil',
      
      // Paginación
      previous: 'Anterior',
      next: 'Siguiente',
      page: 'Página',
      of: 'de',
      showingResults: 'Mostrando {showing} de {total} resultados',
      featuredProfile: 'Perfil destacado'
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
  const [filters, setFilters] = useState<SearchFilters>({});
  const [positions, setPositions] = useState<string[]>([
    'Portero', 'Defensa central', 'Lateral derecho', 'Lateral izquierdo', 
    'Mediocentro defensivo', 'Mediocentro', 'Mediocentro ofensivo', 
    'Extremo derecho', 'Extremo izquierdo', 'Delantero centro'
  ]);
  const [nationalities, setNationalities] = useState<string[]>([
    'Argentina', 'Brasil', 'España', 'Francia', 'Italia', 'Alemania',
    'Inglaterra', 'Portugal', 'Uruguay', 'Colombia', 'México', 'Chile'
  ]);
  const [showFilters, setShowFilters] = useState(false);

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
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      // Añadir parámetros de paginación
      params.append('limit', limit.toString());
      params.append('offset', (page * limit).toString());
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/search/players?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Ordenar los jugadores priorizando los que tienen foto de perfil
      const sortedPlayers = [...response.data.players].sort((a, b) => {
        // Si ambos tienen o no tienen foto, mantener el orden original
        if ((a.imgUrl && b.imgUrl) || (!a.imgUrl && !b.imgUrl)) {
          return 0;
        }
        // Si a tiene foto pero b no, a va primero
        if (a.imgUrl && !b.imgUrl) {
          return -1;
        }
        // Si b tiene foto pero a no, b va primero
        return 1;
      });
      
      setPlayers(sortedPlayers);
      setTotalPlayers(response.data.total);
    } catch (error) {
      console.error('Error al buscar jugadores:', error);
      toast.error(t('errorSearchingPlayers'));
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar envío del formulario de búsqueda
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // Resetear paginación
    searchPlayers();
  };

  // Manejar cambio de página
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
    setPage(0);
    searchPlayers();
  };

  // Renderizar tarjeta de jugador
  const renderPlayerCard = (player: Player) => {
    const hasProfileImage = !!player.imgUrl;
    
    return (
      <div key={player.id} className={`${styles.playerCard} ${hasProfileImage ? styles.hasProfileImage : ''}`}>
        {/* Background header */}
        <div className={styles.playerCardHeader}></div>
        
        {/* Indicador de perfil destacado */}
        {hasProfileImage && (
          <div className={styles.featuredBadge}>
            <span>{t('featuredProfile')}</span>
          </div>
        )}
        
        {/* Column 1: Image and basic info */}
        <div className={styles.playerCardLeft}>
          <div className={styles.playerImageWrapper}>
            <Image 
              src={player.imgUrl || getDefaultPlayerImage()} 
              alt={`${player.name} ${player.lastname}`}
              width={100}
              height={100}
              className={styles.playerImage}
            />
            {hasProfileImage && <div className={styles.profileImageBadge}></div>}
          </div>
          <div className={styles.playerBasicInfo}>
            <h3 className={styles.playerName}>{player.name} {player.lastname}</h3>
            
            {/* Rol/Posición del jugador */}
            <div className={styles.playerRole}>
              <span className={styles.roleLabel}>{player.primaryPosition || t('notSpecified')}</span>
              {player.secondaryPosition && <span className={styles.secondaryRole}> / {player.secondaryPosition}</span>}
            </div>
            
            {/* Nacionalidad con bandera */}
            {player.nationality && (
              <div className={styles.playerNationality}>
                <span className={styles.nationalityFlag}>
                  {renderCountryFlag(player.nationality)}
                </span>
                <span className={styles.nationalityName}>{player.nationality}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Column 2: Details and action button */}
        <div className={styles.playerCardRight}>
          <div className={styles.playerDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{t('age')}:</span>
              <span className={styles.detailValue}>{player.age || t('notSpecified')}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{t('height')}:</span>
              <span className={styles.detailValue}>{player.height ? `${player.height} cm` : t('notSpecified')}</span>
            </div>
            {player.skillfulFoot && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>{t('skillfulFoot')}:</span>
                <span className={styles.detailValue}>{player.skillfulFoot}</span>
              </div>
            )}
            {player.weight && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>{t('weight')}:</span>
                <span className={styles.detailValue}>{player.weight} kg</span>
              </div>
            )}
          </div>
          <div className={styles.playerActions}>
            <Link href={`/user-viewer/${player.id}`} className={styles.viewProfileButton}>
              {t('viewProfile')}
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.playerSearchContainer}>
      <h1>{t('playerSearch')}</h1>
      
      <div className={styles.searchControls}>
        <button 
          className={styles.toggleFiltersButton}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? t('hideFilters') : t('showFilters')}
        </button>
        
        {showFilters && (
          <form onSubmit={handleSubmit} className={styles.filtersForm}>
            <div className={styles.filterRow}>
              <div className={styles.filterField}>
                <label htmlFor="name">{t('nameOrLastname')}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={filters.name || ''}
                  onChange={handleFilterChange}
                  placeholder={t('searchByName')}
                />
              </div>
              
              <div className={styles.filterField}>
                <label htmlFor="primaryPosition">{t('position')}</label>
                <select
                  id="primaryPosition"
                  name="primaryPosition"
                  value={filters.primaryPosition || ''}
                  onChange={handleFilterChange}
                >
                  <option value="">{t('allPositions')}</option>
                  {positions.map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.filterField}>
                <label htmlFor="nationality">{t('nationality')}</label>
                <select
                  id="nationality"
                  name="nationality"
                  value={filters.nationality || ''}
                  onChange={handleFilterChange}
                >
                  <option value="">{t('allNationalities')}</option>
                  {nationalities.map(nationality => (
                    <option key={nationality} value={nationality}>{nationality}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className={styles.filterRow}>
              <div className={styles.filterField}>
                <label htmlFor="minAge">{t('minAge')}</label>
                <input
                  type="number"
                  id="minAge"
                  name="minAge"
                  value={filters.minAge || ''}
                  onChange={handleFilterChange}
                  min={0}
                />
              </div>
              
              <div className={styles.filterField}>
                <label htmlFor="maxAge">{t('maxAge')}</label>
                <input
                  type="number"
                  id="maxAge"
                  name="maxAge"
                  value={filters.maxAge || ''}
                  onChange={handleFilterChange}
                  min={0}
                />
              </div>
              
              <div className={styles.filterField}>
                <label htmlFor="minHeight">{t('minHeight')} (cm)</label>
                <input
                  type="number"
                  id="minHeight"
                  name="minHeight"
                  value={filters.minHeight || ''}
                  onChange={handleFilterChange}
                  min={0}
                />
              </div>
              
              <div className={styles.filterField}>
                <label htmlFor="maxHeight">{t('maxHeight')} (cm)</label>
                <input
                  type="number"
                  id="maxHeight"
                  name="maxHeight"
                  value={filters.maxHeight || ''}
                  onChange={handleFilterChange}
                  min={0}
                />
              </div>
              
              <div className={styles.filterField}>
                <label htmlFor="skillfulFoot">{t('skillfulFoot')}</label>
                <select
                  id="skillfulFoot"
                  name="skillfulFoot"
                  value={filters.skillfulFoot || ''}
                  onChange={handleFilterChange}
                >
                  <option value="">{t('any')}</option>
                  <option value="Derecho">{t('right')}</option>
                  <option value="Izquierdo">{t('left')}</option>
                  <option value="Ambos">{t('both')}</option>
                </select>
              </div>
            </div>
            
            <div className={styles.filterActions}>
              <button type="submit" className={styles.searchButton}>
                {t('search')}
              </button>
              <button type="button" onClick={clearFilters} className={styles.clearButton}>
                {t('clearFilters')}
              </button>
            </div>
          </form>
        )}
      </div>
      
      {loading ? (
        <div className={styles.loadingContainer}>
          <p>{t('loading')}</p>
        </div>
      ) : (
        <>
          <div className={styles.resultsInfo}>
            <p>{t('showingResults', { showing: players.length, total: totalPlayers })}</p>
          </div>
          
          <div className={styles.playersGrid}>
            {players.length > 0 ? (
              players.map(player => renderPlayerCard(player))
            ) : (
              <p className={styles.noResults}>{t('noPlayersFound')}</p>
            )}
          </div>
          
          {totalPlayers > limit && (
            <div className={styles.pagination}>
              <button 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page === 0}
                className={styles.paginationButton}
              >
                {t('previous')}
              </button>
              <span className={styles.pageInfo}>
                {t('page')} {page + 1} {t('of')} {Math.ceil(totalPlayers / limit)}
              </span>
              <button 
                onClick={() => handlePageChange(page + 1)} 
                disabled={page >= Math.ceil(totalPlayers / limit) - 1}
                className={styles.paginationButton}
              >
                {t('next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PlayerSearch; 