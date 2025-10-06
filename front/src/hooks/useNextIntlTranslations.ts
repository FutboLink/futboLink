"use client";

import { useState, useEffect } from 'react';
import { useI18nMode } from '@/components/Context/I18nModeContext';

// Mensajes estáticos para next-intl
const messages = {
  es: {
    common: {
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      cancel: "Cancelar",
      save: "Guardar",
      edit: "Editar",
      delete: "Eliminar",
      search: "Buscar",
      filter: "Filtrar",
      back: "Volver",
      next: "Siguiente",
      previous: "Anterior",
      close: "Cerrar"
    },
    navigation: {
      home: "Inicio",
      jobs: "Empleos",
      about: "Acerca de",
      contact: "Contacto",
      login: "Iniciar Sesión",
      register: "Registrarse",
      profile: "Perfil",
      logout: "Cerrar Sesión",
      courses: "Cursos",
      successCases: "Casos de Éxito",
      news: "Noticias",
      help: "Ayuda",
      subscriptions: "Suscripciones",
      playerSearch: "Búsqueda de Jugadores"
    },
    language: {
      spanish: "Español",
      english: "English",
      italian: "Italiano",
      selectLanguage: "Seleccionar idioma"
    },
    footer: {
      allRightsReserved: "Todos los derechos reservados",
      privacyPolicy: "Política de Privacidad",
      termsOfService: "Términos de Servicio",
      connectingTalents: "Conectando Talentos",
      aboutUs: "Sobre Nosotros",
      contact: "Contacto",
      jobs: "Empleos",
      courses: "Cursos"
    },
    home: {
      title: "Futbolink",
      subtitle: "Creando oportunidades para tu futuro en el fútbol",
      description: "La plataforma líder para conectar talento deportivo con oportunidades profesionales en el mundo del fútbol.",
      jobSearcher: "Buscador de ofertas laborales",
      publishJob: "Publicar oferta laboral",
      coursesTraining: "Cursos y Formaciones"
    }
  },
  en: {
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      search: "Search",
      filter: "Filter",
      back: "Back",
      next: "Next",
      previous: "Previous",
      close: "Close"
    },
    navigation: {
      home: "Home",
      jobs: "Jobs",
      about: "About",
      contact: "Contact",
      login: "Login",
      register: "Register",
      profile: "Profile",
      logout: "Logout",
      courses: "Courses",
      successCases: "Success Cases",
      news: "News",
      help: "Help",
      subscriptions: "Subscriptions",
      playerSearch: "Player Search"
    },
    language: {
      spanish: "Español",
      english: "English",
      italian: "Italiano",
      selectLanguage: "Select language"
    },
    footer: {
      allRightsReserved: "All rights reserved",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      connectingTalents: "Connecting Talents",
      aboutUs: "About Us",
      contact: "Contact",
      jobs: "Jobs",
      courses: "Courses"
    },
    home: {
      title: "Futbolink",
      subtitle: "Creating opportunities for your future in football",
      description: "The leading platform to connect sports talent with professional opportunities in the world of football.",
      jobSearcher: "Job Search Engine",
      publishJob: "Publish Job Offer",
      coursesTraining: "Courses and Training"
    }
  },
  it: {
    common: {
      loading: "Caricamento...",
      error: "Errore",
      success: "Successo",
      cancel: "Annulla",
      save: "Salva",
      edit: "Modifica",
      delete: "Elimina",
      search: "Cerca",
      filter: "Filtra",
      back: "Indietro",
      next: "Avanti",
      previous: "Precedente",
      close: "Chiudi"
    },
    navigation: {
      home: "Home",
      jobs: "Lavori",
      about: "Chi siamo",
      contact: "Contatto",
      login: "Accedi",
      register: "Registrati",
      profile: "Profilo",
      logout: "Esci",
      courses: "Corsi",
      successCases: "Casi di Successo",
      news: "Notizie",
      help: "Aiuto",
      subscriptions: "Abbonamenti",
      playerSearch: "Ricerca Giocatori"
    },
    language: {
      spanish: "Español",
      english: "English",
      italian: "Italiano",
      selectLanguage: "Seleziona lingua"
    },
    footer: {
      allRightsReserved: "Tutti i diritti riservati",
      privacyPolicy: "Informativa sulla Privacy",
      termsOfService: "Termini di Servizio",
      connectingTalents: "Connettendo Talenti",
      aboutUs: "Chi Siamo",
      contact: "Contatto",
      jobs: "Lavori",
      courses: "Corsi"
    },
    home: {
      title: "Futbolink",
      subtitle: "Creare opportunità per il tuo futuro nel calcio",
      description: "La piattaforma leader per connettere talenti sportivi con opportunità professionali nel mondo del calcio.",
      jobSearcher: "Motore di Ricerca Lavoro",
      publishJob: "Pubblica Offerta di Lavoro",
      coursesTraining: "Corsi e Formazione"
    }
  }
};

type Locale = 'es' | 'en' | 'it';
type MessageKey = keyof typeof messages.es;

export const useNextIntlTranslations = (namespace: MessageKey) => {
  const { isNextIntlEnabled } = useI18nMode();
  const [locale, setLocale] = useState<Locale>('es');

  useEffect(() => {
    // Obtener idioma guardado o detectar del navegador
    const savedLocale = localStorage.getItem('nextintl-locale') as Locale;
    if (savedLocale && ['es', 'en', 'it'].includes(savedLocale)) {
      setLocale(savedLocale);
    } else {
      const browserLang = navigator.language.substring(0, 2) as Locale;
      setLocale(['es', 'en', 'it'].includes(browserLang) ? browserLang : 'es');
    }

    // Escuchar cambios de idioma
    const handleLocaleChange = (event: CustomEvent) => {
      setLocale(event.detail);
    };

    window.addEventListener('nextintl-locale-change', handleLocaleChange as EventListener);
    
    return () => {
      window.removeEventListener('nextintl-locale-change', handleLocaleChange as EventListener);
    };
  }, []);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('nextintl-locale', newLocale);
    // Disparar evento para notificar el cambio
    window.dispatchEvent(new CustomEvent('nextintl-locale-change', { detail: newLocale }));
  };

  const t = (key: string) => {
    if (!isNextIntlEnabled) {
      return key; // Fallback si next-intl no está habilitado
    }

    try {
      const namespaceMessages = messages[locale][namespace] as any;
      return namespaceMessages[key] || key;
    } catch {
      return key;
    }
  };

  return {
    t,
    locale,
    changeLocale,
    isNextIntlEnabled
  };
};
