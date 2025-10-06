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
      playerSearch: "Búsqueda de Jugadores",
      // Navbar links
      aboutFutbolink: "Sobre Futbolink",
      offers: "Ofertas",
      // Sidebar
      myProfile: "Mi Perfil",
      createOffer: "Crear Oferta",
      myOffers: "Mis Ofertas",
      portfolio: "Portafolio",
      searchPlayers: "Buscar Jugadores",
      market: "Mercado",
      editProfile: "Editar Perfil",
      applications: "Postulaciones",
      training: "Entrenamiento",
      settings: "Configuración",
      improvePlan: "Mejorar Plan",
      improveProfile: "Mejorar Perfil",
      create: "Crear",
      search: "Buscar",
      createNews: "Crear Noticia",
      createCourse: "Crear Curso"
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
    },
    auth: {
      // Login
      loginTitle: "Iniciar sesión",
      email: "Correo electrónico",
      emailPlaceholder: "Email",
      password: "Contraseña",
      passwordPlaceholder: "Contraseña",
      loginButton: "Ingresar",
      noAccount: "¿No tienes cuenta?",
      registerHere: "Regístrate aquí",
      forgotPassword: "Olvidé mi contraseña",
      // Messages
      loginSuccess: "Has ingresado correctamente",
      loginError: "Usuario o contraseña incorrectos",
      generalError: "Ocurrió un error, intenta de nuevo",
      // Register
      registerTitle: "Registro para Jugadores y Profesionales",
      firstName: "Tu nombre",
      lastName: "Tu apellido",
      phone: "Teléfono",
      nationality: "Nacionalidad",
      searchNationality: "Buscar nacionalidad...",
      gender: "Género",
      selectGender: "Selecciona tu género",
      male: "Masculino",
      female: "Femenino",
      other: "Otr@s",
      currentLocation: "País donde resides actualmente",
      agencyName: "Nombre de tu agencia o empresa",
      confirmPassword: "Confirmar contraseña",
      acceptTerms: "Debe aceptar los términos y condiciones.",
      registerSuccess: "Registro exitoso",
      registerError: "Registro inválido. Por favor, revisa los datos ingresados.",
      emailExists: "Este correo ya está registrado",
      passwordMismatch: "Las contraseñas no coinciden",
      // Categories
      footballer: "Futbolista",
      technicalStaff: "Cuerpo Técnico / Staff Deportivo",
      managementComm: "Dirección y Comunicación",
      agency: "Profesionales Independientes / Representación",
      entityClub: "Entidad / Club",
      // Labels
      roleLabel: "Rol",
      agencyNameLabel: "Nombre de la Agencia",
      nameLabel: "Nombre",
      lastNameLabel: "Apellido",
      emailLabel: "Email",
      nationalityLabel: "Nacionalidad",
      phoneLabel: "Teléfono:",
      genderLabel: "Género",
      currentResidence: "País de Residencia Actual",
      passwordLabel: "Contraseña",
      confirmPasswordLabel: "Confirmar Contraseña"
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
      playerSearch: "Player Search",
      // Navbar links
      aboutFutbolink: "About Futbolink",
      offers: "Offers",
      // Sidebar
      myProfile: "My Profile",
      createOffer: "Create Offer",
      myOffers: "My Offers",
      portfolio: "Portfolio",
      searchPlayers: "Search Players",
      market: "Market",
      editProfile: "Edit Profile",
      applications: "Applications",
      training: "Training",
      settings: "Settings",
      improvePlan: "Upgrade Plan",
      improveProfile: "Improve Profile",
      create: "Create",
      search: "Search",
      createNews: "Create News",
      createCourse: "Create Course"
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
    },
    auth: {
      // Login
      loginTitle: "Login",
      email: "Email",
      emailPlaceholder: "Email",
      password: "Password",
      passwordPlaceholder: "Password",
      loginButton: "Sign In",
      noAccount: "Don't have an account?",
      registerHere: "Register here",
      forgotPassword: "Forgot my password",
      // Messages
      loginSuccess: "You have successfully logged in",
      loginError: "Incorrect username or password",
      generalError: "An error occurred, please try again",
      // Register
      registerTitle: "Registration for Players and Professionals",
      firstName: "Your name",
      lastName: "Your surname",
      phone: "Phone",
      nationality: "Nationality",
      searchNationality: "Search nationality...",
      gender: "Gender",
      selectGender: "Select your gender",
      male: "Male",
      female: "Female",
      other: "Others",
      currentLocation: "Country where you currently reside",
      agencyName: "Name of your agency or company",
      confirmPassword: "Confirm password",
      acceptTerms: "You must accept the terms and conditions.",
      registerSuccess: "Registration successful",
      registerError: "Invalid registration. Please check the entered data.",
      emailExists: "This email is already registered",
      passwordMismatch: "Passwords do not match",
      // Categories
      footballer: "Footballer",
      technicalStaff: "Technical Staff / Sports Staff",
      managementComm: "Management and Communication",
      agency: "Independent Professionals / Representation",
      entityClub: "Entity / Club",
      // Labels
      roleLabel: "Role",
      agencyNameLabel: "Agency Name",
      nameLabel: "Name",
      lastNameLabel: "Last Name",
      emailLabel: "Email",
      nationalityLabel: "Nationality",
      phoneLabel: "Phone:",
      genderLabel: "Gender",
      currentResidence: "Current Country of Residence",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm Password"
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
      playerSearch: "Ricerca Giocatori",
      // Navbar links
      aboutFutbolink: "Su Futbolink",
      offers: "Offerte",
      // Sidebar
      myProfile: "Il Mio Profilo",
      createOffer: "Crea Offerta",
      myOffers: "Le Mie Offerte",
      portfolio: "Portfolio",
      searchPlayers: "Cerca Giocatori",
      market: "Mercato",
      editProfile: "Modifica Profilo",
      applications: "Candidature",
      training: "Allenamento",
      settings: "Impostazioni",
      improvePlan: "Aggiorna Piano",
      improveProfile: "Migliora Profilo",
      create: "Crea",
      search: "Cerca",
      createNews: "Crea Notizia",
      createCourse: "Crea Corso"
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
    },
    auth: {
      // Login
      loginTitle: "Accedi",
      email: "Email",
      emailPlaceholder: "Email",
      password: "Password",
      passwordPlaceholder: "Password",
      loginButton: "Entra",
      noAccount: "Non hai un account?",
      registerHere: "Registrati qui",
      forgotPassword: "Ho dimenticato la password",
      // Messages
      loginSuccess: "Hai effettuato l'accesso correttamente",
      loginError: "Nome utente o password errati",
      generalError: "Si è verificato un errore, riprova",
      // Register
      registerTitle: "Registrazione per Giocatori e Professionisti",
      firstName: "Il tuo nome",
      lastName: "Il tuo cognome",
      phone: "Telefono",
      nationality: "Nazionalità",
      searchNationality: "Cerca nazionalità...",
      gender: "Genere",
      selectGender: "Seleziona il tuo genere",
      male: "Maschio",
      female: "Femmina",
      other: "Altri",
      currentLocation: "Paese dove risiedi attualmente",
      agencyName: "Nome della tua agenzia o azienda",
      confirmPassword: "Conferma password",
      acceptTerms: "Devi accettare i termini e le condizioni.",
      registerSuccess: "Registrazione completata",
      registerError: "Registrazione non valida. Controlla i dati inseriti.",
      emailExists: "Questa email è già registrata",
      passwordMismatch: "Le password non corrispondono",
      // Categories
      footballer: "Calciatore",
      technicalStaff: "Staff Tecnico / Staff Sportivo",
      managementComm: "Direzione e Comunicazione",
      agency: "Professionisti Indipendenti / Rappresentanza",
      entityClub: "Entità / Club",
      // Labels
      roleLabel: "Ruolo",
      agencyNameLabel: "Nome Agenzia",
      nameLabel: "Nome",
      lastNameLabel: "Cognome",
      emailLabel: "Email",
      nationalityLabel: "Nazionalità",
      phoneLabel: "Telefono:",
      genderLabel: "Genere",
      currentResidence: "Paese di Residenza Attuale",
      passwordLabel: "Password",
      confirmPasswordLabel: "Conferma Password"
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
      // Detectar idioma del navegador con fallbacks
      const detectBrowserLanguage = (): Locale => {
        // Obtener idiomas preferidos del navegador
        const languages = navigator.languages || [navigator.language];
        
        for (const lang of languages) {
          const langCode = lang.substring(0, 2).toLowerCase();
          if (['es', 'en', 'it'].includes(langCode)) {
            return langCode as Locale;
          }
        }
        
        // Fallback a español
        return 'es';
      };
      
      const detectedLang = detectBrowserLanguage();
      setLocale(detectedLang);
      
      // Guardar la detección automática
      localStorage.setItem('nextintl-locale', detectedLang);
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
