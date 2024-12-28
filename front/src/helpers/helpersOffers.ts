const offers = [
  {
    id: 1,
    title: "Entrenadores para AFA Internacional en South Florida, EEUU",
    description:
      "¿Apasionado por la formación de talentos? Buscamos entrenadores para nuestra Academia del Fútbol Argentino en Pembroke Pines, South Florida.",
    projectDescription:
      "La Academia ofrece programas formativos y competitivos para jugadores de 4 a 18 años. Los entrenadores son capacitados por la AFA para poder aplicar el método de entrenamiento del Fútbol Argentino en la formación de futbolistas.",
    requirements: [
      "Contar con documentación legal para trabajar en Estados Unidos (excluyente).",
      "Certificación oficial con Licencia 'D'.",
      "Experiencia previa como entrenador de academias, clubes, universidades o programas juveniles.",
      "Residir en el área de Pembroke Pines y alrededores.",
      "Manejo de los idiomas Español e Inglés (deseable).",
    ],
    responsibilities: [
      "Diseñar y llevar adelante sesiones de entrenamiento semanales.",
      "Asistir a partidos amistosos y de competencia.",
      "Organizar y asistir en el desarrollo de Clínicas, Camps y tryouts.",
      "Evaluar y desarrollar el talento de los jugadores, promoviendo su crecimiento técnico, táctico y personal.",
      "Completar capacitaciones oficiales exigidas por la AFA.",
      "Colaborar con otros entrenadores para garantizar un programa integral y coordinado.",
      "Comunicarse eficazmente con padres y jugadores sobre objetivos, progreso y áreas de mejora.",
    ],
    skills: [
      "Habilidad para liderar grupos y trabajar en equipo.",
      "Excelentes habilidades de comunicación interpersonal.",
      "Pasión por el desarrollo deportivo y personal de los jóvenes.",
      "Adaptabilidad y creatividad para implementar dinámicas innovadoras en los entrenamientos.",
    ],
    location: "Pembroke Pines, South Florida, EEUU",
  },
  {
    id: 2,
    title:
      "Jugadores para Club Atlético Juventud Unida (Buenos Aires, Argentina)",
    description:
      "El Club Atlético Juventud Unida busca jugadores jóvenes para sumarse a sus categorías juveniles y de reserva.",
    projectDescription:
      "Nuestro club es reconocido por desarrollar talentos locales y brindar oportunidades en ligas competitivas. Buscamos jugadores con pasión y compromiso.",
    requirements: [
      "Edad entre 16 y 21 años.",
      "Experiencia previa en categorías juveniles o ligas locales.",
      "Disponibilidad para entrenar en Buenos Aires.",
      "Compromiso con la disciplina y el desarrollo personal.",
    ],
    responsibilities: [
      "Asistir a entrenamientos semanales y partidos oficiales.",
      "Seguir planes de entrenamiento físico y técnico asignados por el cuerpo técnico.",
      "Representar al club en competencias oficiales y amistosos.",
    ],
    skills: [
      "Habilidades técnicas destacadas en el manejo del balón.",
      "Trabajo en equipo y respeto hacia compañeros y entrenadores.",
      "Deseo de crecer profesionalmente en el fútbol.",
    ],
    location: "Buenos Aires, Argentina",
  },
  {
    id: 3,
    title:
      "Preparador Físico para Club de Fútbol Profesional en Monterrey, México",
    description:
      "Estamos en búsqueda de un Preparador Físico con experiencia para trabajar con jugadores profesionales en Monterrey.",
    projectDescription:
      "Nuestro club se encuentra en la primera división y busca optimizar el rendimiento físico de los jugadores con entrenamientos personalizados y modernos.",
    requirements: [
      "Licenciatura en Educación Física, Kinesiología o áreas relacionadas.",
      "Experiencia de al menos 3 años trabajando con equipos profesionales.",
      "Conocimientos avanzados en fisiología del deporte y recuperación física.",
      "Disponibilidad para viajes y horarios flexibles.",
    ],
    responsibilities: [
      "Diseñar planes de entrenamiento físico adaptados a cada jugador.",
      "Monitorear el progreso físico y realizar ajustes en los programas según sea necesario.",
      "Colaborar con el equipo médico para prevenir y tratar lesiones.",
    ],
    skills: [
      "Capacidad para trabajar bajo presión en un entorno profesional.",
      "Conocimientos avanzados en tecnología deportiva.",
      "Excelentes habilidades de comunicación y organización.",
    ],
    location: "Monterrey, México",
  },
  {
    id: 4,
    title: "Director Deportivo para Club de Fútbol en Medellín, Colombia",
    description:
      "Buscamos un Director Deportivo con experiencia en gestión deportiva para liderar nuestro club en Medellín.",
    projectDescription:
      "Nuestro club está en busca de un profesional que pueda desarrollar y ejecutar estrategias para el crecimiento del equipo y la formación de jugadores.",
    requirements: [
      "Experiencia mínima de 5 años en cargos similares.",
      "Titulación en Gestión Deportiva o afín.",
      "Conocimiento del mercado futbolístico internacional.",
      "Disponibilidad para viajes y trabajo en equipo.",
    ],
    responsibilities: [
      "Diseñar y ejecutar estrategias de crecimiento deportivo.",
      "Coordinar el trabajo de entrenadores, cuerpo técnico y jugadores.",
      "Gestionar relaciones con patrocinadores y medios de comunicación.",
    ],
    skills: [
      "Liderazgo y visión estratégica.",
      "Capacidad de análisis y toma de decisiones.",
      "Red de contactos en el ámbito futbolístico.",
    ],
    location: "Medellín, Colombia",
  },
  {
    id: 5,
    title: "Analista de Rendimiento para Club de Fútbol en Lima, Perú",
    description:
      "Estamos en busca de un analista de rendimiento para evaluar y optimizar el rendimiento de nuestros jugadores.",
    projectDescription:
      "El analista de rendimiento será responsable de recopilar y analizar datos sobre el rendimiento de los jugadores en partidos y entrenamientos.",
    requirements: [
      "Titulación en Ciencias del Deporte o afín.",
      "Experiencia en análisis de datos deportivos.",
      "Dominio de herramientas de análisis y estadísticas.",
      "Capacidad de generar informes detallados y útiles para el cuerpo técnico.",
    ],
    responsibilities: [
      "Recopilar y analizar datos de partidos y entrenamientos.",
      "Generar informes detallados sobre el rendimiento de los jugadores.",
      "Proponer ajustes tácticos y físicos en base a los análisis.",
    ],
    skills: [
      "Conocimiento avanzado de análisis de datos.",
      "Capacidad para trabajar bajo presión.",
      "Habilidades de comunicación efectiva.",
    ],
    location: "Lima, Perú",
  },
  {
    id: 6,
    title: "Portero para Club de Fútbol en Caracas, Venezuela",
    description:
      "El Club de Fútbol de Caracas está buscando un portero con experiencia para reforzar su plantel.",
    projectDescription:
      "El club busca un arquero con habilidades excepcionales y gran capacidad de liderazgo para cubrir la portería en competiciones nacionales e internacionales.",
    requirements: [
      "Experiencia mínima de 3 años como portero profesional.",
      "Excelentes habilidades de reacción y reflejos.",
      "Capacidad de liderazgo en el campo.",
      "Disponibilidad para integrarse al club de inmediato.",
    ],
    responsibilities: [
      "Proteger el arco en todos los partidos y entrenamientos.",
      "Colaborar con el cuerpo técnico en la preparación de los partidos.",
      "Liderar la defensa y organizar el equipo durante el juego.",
    ],
    skills: [
      "Reflejos rápidos y habilidades técnicas en la portería.",
      "Capacidad de comunicación con los defensores.",
      "Liderazgo y actitud competitiva.",
    ],
    location: "Caracas, Venezuela",
  },
  {
    id: 7,
    title: "Fisioterapeuta Deportivo para Fútbol en Quito, Ecuador",
    description:
      "El club necesita un fisioterapeuta deportivo para la recuperación y rehabilitación de nuestros jugadores.",
    projectDescription:
      "El fisioterapeuta trabajará directamente con el cuerpo médico para asegurar la recuperación óptima de los jugadores lesionados.",
    requirements: [
      "Licenciatura en Fisioterapia o similar.",
      "Experiencia trabajando con deportistas de alto rendimiento.",
      "Capacitación en rehabilitación de lesiones deportivas.",
      "Disponibilidad para atender emergencias durante los partidos.",
    ],
    responsibilities: [
      "Brindar atención fisioterapéutica a jugadores lesionados.",
      "Desarrollar programas de prevención de lesiones.",
      "Colaborar con el cuerpo médico en el seguimiento de la recuperación de los jugadores.",
    ],
    skills: [
      "Conocimiento avanzado en rehabilitación deportiva.",
      "Capacidad para trabajar bajo presión.",
      "Comunicación eficaz con jugadores y cuerpo técnico.",
    ],
    location: "Quito, Ecuador",
  },
  {
    id: 8,
    title: "Scouter para Club Profesional en Santiago, Chile",
    description:
      "Buscamos un scouter para identificar y evaluar nuevos talentos para nuestro club profesional.",
    projectDescription:
      "El scouter será responsable de asistir a partidos y entrenamientos para descubrir talentos que puedan unirse a nuestro club.",
    requirements: [
      "Experiencia en scouting deportivo.",
      "Conocimiento profundo del fútbol nacional e internacional.",
      "Capacidad para evaluar talentos técnicos y tácticos.",
    ],
    responsibilities: [
      "Asistir a partidos y entrenamientos de diversas categorías.",
      "Realizar informes sobre jugadores evaluados.",
      "Colaborar con el cuerpo técnico en la toma de decisiones de fichajes.",
    ],
    skills: [
      "Conocimiento amplio sobre el talento futbolístico.",
      "Capacidad de análisis y observación.",
      "Excelente red de contactos en el ámbito futbolístico.",
    ],
    location: "Santiago, Chile",
  },

  {
    id: 9,
    title:
      "Gerente de Marketing Deportivo para Club de Fútbol en Buenos Aires, Argentina",
    description:
      "Estamos buscando un Gerente de Marketing Deportivo para liderar las estrategias de promoción y marketing de nuestro club en Buenos Aires.",
    projectDescription:
      "El gerente será responsable de diseñar y ejecutar estrategias de marketing para aumentar la visibilidad del club y generar mayores ingresos a través de la venta de entradas, mercancía y patrocinios.",
    requirements: [
      "Licenciatura en Marketing, Comunicación o afines.",
      "Experiencia mínima de 4 años en marketing deportivo.",
      "Conocimiento de las dinámicas del fútbol y el mercado local.",
      "Capacidad para desarrollar campañas de marketing en redes sociales y otros medios.",
    ],
    responsibilities: [
      "Desarrollar e implementar estrategias de marketing para mejorar la visibilidad y los ingresos del club.",
      "Gestionar la relación con patrocinadores y medios de comunicación.",
      "Liderar un equipo de trabajo para la ejecución de campañas promocionales.",
      "Colaborar con otras áreas del club para crear sinergias y optimizar recursos.",
    ],
    skills: [
      "Liderazgo y capacidad de trabajo en equipo.",
      "Creatividad y habilidades de comunicación.",
      "Conocimiento avanzado en redes sociales y marketing digital.",
    ],
    location: "Buenos Aires, Argentina",
  },
  {
    id: 10,
    title:
      "Jefe de Nutrición Deportiva para Club de Fútbol en Sao Paulo, Brasil",
    description:
      "El Club de Fútbol de Sao Paulo busca un Jefe de Nutrición Deportiva para implementar un plan de alimentación y recuperación para sus jugadores.",
    projectDescription:
      "El jefe de nutrición será responsable de optimizar el rendimiento de los jugadores a través de un plan nutricional adecuado y personalizado según las necesidades del equipo.",
    requirements: [
      "Licenciatura en Nutrición o áreas relacionadas.",
      "Experiencia trabajando con deportistas de alto rendimiento, preferentemente en fútbol.",
      "Conocimiento en dietas de alto rendimiento y suplementación deportiva.",
      "Capacidad para trabajar en equipo con entrenadores, médicos y fisioterapeutas.",
    ],
    responsibilities: [
      "Diseñar planes nutricionales individualizados para los jugadores.",
      "Monitorear la alimentación diaria de los jugadores.",
      "Asesorar en la suplementación deportiva y la hidratación.",
      "Realizar un seguimiento de la salud y el bienestar nutricional de los jugadores.",
    ],
    skills: [
      "Capacidad para crear planes nutricionales efectivos.",
      "Trabajo en equipo y habilidades de comunicación.",
      "Conocimiento avanzado de nutrición deportiva.",
    ],
    location: "Sao Paulo, Brasil",
  },
  {
    id: 11,
    title: "Preparador de Arqueros para Club de Fútbol en Bogotá, Colombia",
    description:
      "El Club de Fútbol en Bogotá está buscando un preparador de arqueros para entrenar y mejorar las habilidades de nuestros porteros.",
    projectDescription:
      "El preparador de arqueros trabajará directamente con los porteros, enfocándose en mejorar sus habilidades técnicas, tácticas y psicológicas.",
    requirements: [
      "Experiencia mínima de 3 años como preparador de arqueros.",
      "Conocimiento de técnicas de entrenamiento específicas para porteros.",
      "Capacidad para trabajar en equipo y colaborar con el cuerpo técnico.",
      "Disponibilidad para entrenamientos y partidos.",
    ],
    responsibilities: [
      "Diseñar y ejecutar entrenamientos específicos para los porteros.",
      "Monitorear el desempeño de los porteros en los entrenamientos y partidos.",
      "Colaborar con el cuerpo técnico en la planificación de partidos y entrenamientos.",
    ],
    skills: [
      "Conocimiento avanzado en técnicas de porteros.",
      "Habilidad para trabajar con jugadores jóvenes y adultos.",
      "Capacidad de análisis y corrección de errores técnicos.",
    ],
    location: "Bogotá, Colombia",
  },
  {
    id: 12,
    title: "Entrenador de Fútbol Femenino para Club en Montevideo, Uruguay",
    description:
      "Nuestro club en Montevideo está buscando un entrenador para nuestra categoría de fútbol femenino.",
    projectDescription:
      "El entrenador de fútbol femenino será responsable de dirigir y desarrollar el equipo femenino, promoviendo el crecimiento individual y colectivo de las jugadoras.",
    requirements: [
      "Experiencia mínima de 2 años como entrenador de fútbol femenino.",
      "Conocimiento y pasión por el fútbol femenino.",
      "Certificación en entrenamiento de fútbol.",
      "Disponibilidad para entrenamientos y partidos.",
    ],
    responsibilities: [
      "Planificar y dirigir los entrenamientos del equipo femenino.",
      "Fomentar un ambiente positivo y competitivo.",
      "Colaborar con el cuerpo técnico en el desarrollo de estrategias y tácticas.",
      "Representar al club en competiciones oficiales y amistosos.",
    ],
    skills: [
      "Liderazgo y habilidades de motivación.",
      "Conocimiento técnico y táctico del fútbol.",
      "Capacidad para gestionar y dirigir un equipo de fútbol femenino.",
    ],
    location: "Montevideo, Uruguay",
  },
  {
    id: 13,
    title: "Médico Deportivo para Club Profesional en Ciudad de México",
    description:
      "Estamos buscando un médico deportivo para el seguimiento y cuidado de la salud de nuestros jugadores profesionales.",
    projectDescription:
      "El médico deportivo será responsable de proporcionar atención médica preventiva, de emergencia y de rehabilitación a los jugadores.",
    requirements: [
      "Licenciatura en Medicina con especialización en Medicina Deportiva.",
      "Experiencia trabajando con futbolistas profesionales.",
      "Conocimiento de lesiones comunes en el fútbol y su tratamiento.",
      "Disponibilidad para atender emergencias durante partidos y entrenamientos.",
    ],
    responsibilities: [
      "Proveer atención médica preventiva y de emergencia durante los entrenamientos y partidos.",
      "Desarrollar planes de rehabilitación para jugadores lesionados.",
      "Colaborar con el equipo de fisioterapia y preparadores físicos.",
      "Realizar chequeos médicos regulares y seguimiento de la salud de los jugadores.",
    ],
    skills: [
      "Conocimiento profundo de la medicina deportiva.",
      "Habilidad para trabajar bajo presión y en situaciones de emergencia.",
      "Comunicación efectiva con jugadores y cuerpo técnico.",
    ],
    location: "Ciudad de México",
  },
];

export default offers;
