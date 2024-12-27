const newsArticles = [
  {
    id: 1,
    title: "Nueva Oferta de Empleo en el Futbol",
    description:
      "Un importante club de fútbol está buscando nuevos talentos para unirse a su equipo profesional. Si tienes lo que se necesita, esta podría ser tu oportunidad de brillar en el campo.",
    imageUrl:
      "https://img.freepik.com/foto-gratis/hombre-jugando-al-futbol-playa_23-2147803093.jpg?t=st=1735327909~exp=1735331509~hmac=d4983b2051d3c23bfac00246392036e9a028010e87d5f43be04a8b8bb7a37d43&w=360", // Imagen representativa de fútbol
    imageAlt: "Jugador de fútbol pateando balón en el campo",
  },
  {
    id: 2,
    title: "Curso de Formación para Jugadores",
    description:
      "Nuestro curso intensivo de formación te brindará las habilidades necesarias para destacar en el mundo del fútbol. Aprende de los mejores entrenadores y mejora tu rendimiento en el campo.",
    imageUrl:
      "https://img.freepik.com/foto-gratis/deportista-pelota-celebrando-victoria_23-2147817374.jpg?t=st=1735327921~exp=1735331521~hmac=5b1a35132ffb5b8316f5327017af9bae24db78bfe91740bbe35349bfe71d9835&w=360", // Jugador entrenando con balón
    imageAlt: "Jugador de fútbol entrenando con balón",
  },
  {
    id: 3,
    title: "Noticias del Mercado de Transferencias",
    description:
      "Las últimas noticias sobre el mercado de fichajes: los movimientos más recientes y las posibles sorpresas que cambiarán la temporada de fútbol. Mantente informado sobre lo que sucede en los clubes de élite.",
    imageUrl:
      "https://img.freepik.com/foto-gratis/cerca-hombres-emocionales-jugando-al-futbol-golpeando-pelota-cabeza-aislada-pared-blanca-futbol-deporte-expresion-facial-concepto-emociones-humanas-copyspace-lucha-gol_155003-33573.jpg?t=st=1735327932~exp=1735331532~hmac=368d369f6d6be176966b50691a3393ec93a390454952538208e3703efc7828d5&w=996", // Noticias sobre fútbol y mercado de fichajes
    imageAlt: "Portada de noticias sobre el fútbol y mercado de fichajes",
  },
  {
    id: 4,
    title: "Noticias del Futbol Argentino",
    description:
      "El fútbol argentino vive momentos de alta tensión. Conoce las últimas noticias sobre fichajes, partidos y todo lo relacionado con el fútbol en Argentina.",
    imageUrl:
      "https://img.freepik.com/foto-gratis/hombre-jugando-al-futbol-playa_23-2147803093.jpg?t=st=1735327909~exp=1735331509~hmac=d4983b2051d3c23bfac00246392036e9a028010e87d5f43be04a8b8bb7a37d43&w=360", // Bandera de Argentina con balón de fútbol
    imageAlt: "Bandera de Argentina con balón de fútbol",
  },
  {
    id: 5,
    title: "Fútbol Femenino: Aumento de Visibilidad en el Deporte",
    description:
      "El fútbol femenino está ganando protagonismo en todo el mundo. Descubre cómo los equipos femeninos están rompiendo barreras y conquistando corazones.",
    imageUrl:
      "https://img.freepik.com/foto-gratis/deportista-atractivo-bola-celebrando-victoria_23-2147817375.jpg?t=st=1735327946~exp=1735331546~hmac=2249750309cf63c61a6e3b2e4f06c0fbfd660d46852c6cd00ee1522d0c99d13c&w=740", // Jugadora de fútbol femenino
    imageAlt: "Jugadora de fútbol femenino en acción",
  },
  {
    id: 6,
    title: "La Revolución de la Tecnología en el Fútbol",
    description:
      "El uso de la tecnología en el fútbol está cambiando la forma en que se entrenan los equipos y se juegan los partidos. ¿Cómo influye el VAR y las estadísticas en tiempo real?",
    imageUrl:
      "https://img.freepik.com/foto-gratis/deportista-pelota-celebrando-victoria_23-2147817374.jpg?t=st=1735327921~exp=1735331521~hmac=5b1a35132ffb5b8316f5327017af9bae24db78bfe91740bbe35349bfe71d9835&w=360", // Tecnología aplicada al fútbol en el campo
    imageAlt: "Tecnología aplicada al fútbol en el campo de juego",
  },
  {
    id: 7,
    title: "La Influencia de los Medios Sociales en el Fútbol",
    description:
      "Las redes sociales juegan un papel fundamental en la carrera de los futbolistas. Conoce cómo influyen en su imagen y el marketing deportivo.",
    imageUrl:
      "https://img.freepik.com/foto-gratis/deportista-atractivo-bola-celebrando-victoria_23-2147817375.jpg?t=st=1735327946~exp=1735331546~hmac=2249750309cf63c61a6e3b2e4f06c0fbfd660d46852c6cd00ee1522d0c99d13c&w=740", // Futbolista en redes sociales
    imageAlt: "Futbolista en redes sociales",
  },
  {
    id: 8,
    title: "Cómo Prepararse para una Prueba de Fútbol Profesional",
    description:
      "Si sueñas con jugar en un equipo profesional, debes estar preparado para las pruebas. Aquí te damos algunos consejos clave para destacar en la selección.",
    imageUrl:
      "https://img.freepik.com/foto-gratis/cerca-hombres-emocionales-jugando-al-futbol-golpeando-pelota-cabeza-aislada-pared-blanca-futbol-deporte-expresion-facial-concepto-emociones-humanas-copyspace-lucha-gol_155003-33573.jpg?t=st=1735327932~exp=1735331532~hmac=368d369f6d6be176966b50691a3393ec93a390454952538208e3703efc7828d5&w=996", // Jugadores entrenando en el campo
    imageAlt: "Jugadores entrenando en el campo",
  },
  {
    id: 9,
    title: "Los Equipos Más Exitosos de la Historia del Fútbol",
    description:
      "Repasamos los clubes que han dejado huella en el fútbol mundial, con victorias épicas y jugadores que son leyendas. ¿Cuál es tu favorito?",
    imageUrl:
      "https://img.freepik.com/foto-gratis/deportista-pelota-celebrando-victoria_23-2147817374.jpg?t=st=1735327921~exp=1735331521~hmac=5b1a35132ffb5b8316f5327017af9bae24db78bfe91740bbe35349bfe71d9835&w=360", // Emblema de un club histórico
    imageAlt: "Emblema de un club de fútbol histórico",
  },
  {
    id: 10,
    title: "El Futuro del Fútbol: Tendencias y Novedades",
    description:
      "El fútbol está en constante evolución. ¿Qué nos espera en los próximos años? Conoce las tendencias tecnológicas, tácticas y deportivas que marcarán el futuro.",
    imageUrl:
      "https://img.freepik.com/foto-gratis/deportista-atractivo-bola-celebrando-victoria_23-2147817375.jpg?t=st=1735327946~exp=1735331546~hmac=2249750309cf63c61a6e3b2e4f06c0fbfd660d46852c6cd00ee1522d0c99d13c&w=740", // Futbolistas en el campo bajo un cielo al atardecer
    imageAlt: "Futbolistas en el campo bajo un cielo al atardecer",
  },
];

export default newsArticles;
