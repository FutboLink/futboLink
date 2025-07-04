"use client";

import React, { useEffect, useState, useContext } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import styles from "../../Styles/cardSub.module.css";
import Image from "next/image";
import { UserContext } from "../Context/UserContext";
import { useRouter } from "next/navigation";

function ManagerSubscription() {
  const [isLoading, setIsLoading] = useState<{ [key: number]: boolean }>({});
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { isLogged, user } = useContext(UserContext);
  const router = useRouter();

  // Planes específicos para managers
  const managerSubscriptionOptions = [
    {
      title: "Gratuito",
      image: "/botin1.svg",
      slogan: "Comienza a reclutar",
      features: [
        { text: "Perfil de empresa básico", available: true },
        { text: "Publicar hasta 3 ofertas por mes", available: true },
        { text: "Buscar candidatos limitado", available: true },
        { text: "Soporte por email", available: true },
        { text: "Análisis avanzados", available: false },
        { text: "Publicaciones ilimitadas", available: false },
        { text: "Búsqueda avanzada", available: false },
        { text: "Soporte prioritario", available: false },
      ],
      monthlyPrice: "GRATIS",
      yearlyPrice: "GRATIS",
      buttonLabel: "Comenzar Gratis",
      bgColor: "bg-white",
      textColor: "text-gray-800",
      borderColor: "border-gray-300",
      buttonColor: "bg-verde-oscuro",
      priceId: { monthly: null, yearly: null },
    },
    {
      title: "Profesional",
      image: "/botin3.svg",
      slogan: "Reclutamiento sin límites",
      features: [
        { text: "Perfil de empresa completo", available: true },
        { text: "Publicaciones ilimitadas", available: true, highlight: true },
        { text: "Búsqueda avanzada de candidatos", available: true },
        { text: "Análisis y estadísticas", available: true },
        { text: "Soporte prioritario", available: true },
        { text: "Destacar ofertas", available: true },
        { text: "Filtros especializados", available: true },
        { text: "Reportes personalizados", available: true },
      ],
      monthlyPrice: "€19,95",
      yearlyPrice: "€199,95 Anual (-15%)",
      buttonLabel: "Contratar",
      bgColor: "bg-gradient-to-b from-[#255b2d] to-[#1d5126]",
      textColor: "text-white",
      borderColor: "border-verde-oscuro",
      buttonColor: "bg-white text-verde-oscuro hover:bg-gray-100",
      priceId: {
        monthly: "price_1R7MaqGbCHvHfqXFimcCzvlo", // Usar el mismo priceId del plan profesional existente
        yearly: "price_1R7MbgGbCHvHfqXFYECGw8S9"
      },
      productId: "prod_S1PP1zfIAIwheC",
      recommended: true,
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      AOS.init();
    }
  }, []);

  // Estado de selección de plan
  const [selectedPlans, setSelectedPlans] = useState<{ [key: number]: string }>(
    () =>
      managerSubscriptionOptions.reduce((acc, _, index) => {
        acc[index] = managerSubscriptionOptions[index].priceId.monthly ?? "";
        return acc;
      }, {} as { [key: number]: string })
  );

  const handleSubscribe = async (index: number, priceId: string) => {
    if (!priceId) {
      // Para el plan gratuito, redirigir al dashboard o home
      router.push("/PanelUsers/Manager");
      return;
    }
    
    // Verificar si el usuario está autenticado
    if (!isLogged || !user) {
      // Si no está autenticado, redirigir al login
      console.log("Usuario no autenticado. Redirigiendo al login...");
      router.push("/Login");
      return;
    }
    
    setIsLoading({ ...isLoading, [index]: true });

    try {
      // Obtener el email del usuario del contexto
      const userEmail = user.email || localStorage.getItem('userEmail');
      
      if (!userEmail) {
        console.error("No se pudo obtener el email del usuario");
        alert("Error: No se pudo obtener el email del usuario. Por favor, inicia sesión nuevamente.");
        router.push("/Login");
        return;
      }
      
      // Get the product ID if available
      const option = managerSubscriptionOptions[index];
      const productId = option.productId;
      
      // Determinar el tipo de plan basado en el nombre del plan
      const planName = option.title;
      
      console.log(`Creating subscription with price ID: ${priceId}`);
      console.log(`User email: ${userEmail}`);
      if (productId) {
        console.log(`Using product ID: ${productId}`);
      }
      console.log(`API URL: ${apiUrl}/payments/subscription`);
      
      // Crear la URL de éxito que incluye el parámetro del plan
      const successUrl = `${window.location.origin}/payment/success?plan=${planName}`;
      
      const response = await fetch(
        `${apiUrl}/payments/subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            priceId,
            customerEmail: userEmail,
            successUrl: successUrl,
            cancelUrl: `${window.location.origin}/payment/cancel`,
            description: "Suscripción de Manager a FutboLink",
            ...(productId && { productId }),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        throw new Error(`Error HTTP: ${response.status}. ${errorData}`);
      }

      const data = await response.json();
      
      if (data.url) {
        console.log(`Redirecting to: ${data.url}`);
        window.location.href = data.url;
      } else {
        console.error("Response data:", data);
        throw new Error("No se recibió URL de pago");
      }
    } catch (error) {
      console.error("Error al crear la sesión de pago:", error);
      alert(`Error al procesar el pago: ${error instanceof Error ? error.message : 'Desconocido'}. Por favor, inténtelo de nuevo más tarde.`);
    } finally {
      setIsLoading({ ...isLoading, [index]: false });
    }
  };

  const handleFreePlan = () => {
    // Redirigir al panel del manager
    router.push("/PanelUsers/Manager");
  };

  return (
    <section className={styles.section}>
      <div className={styles.intro} data-aos="fade-up" data-aos-duration="1000">
        <h1>Elige tu Plan de Reclutamiento</h1>
        <p>
          Selecciona el plan que mejor se adapte a tus necesidades de reclutamiento 
          y comienza a encontrar el talento que tu equipo necesita.
        </p>
      </div>

      <div className={styles.grid}>
        {managerSubscriptionOptions.map((option, index) => (
          <div
            key={index}
            className={styles.cardContainer}
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            <div className={styles.card}>
              <div
                className={`${styles.cardFront} ${
                  styles[option.title.toLowerCase()]
                }`}
              >
                <h3 className={styles.title}>{option.title}</h3>
                <p className={`${styles.slogan}`}>{option.slogan}</p>
                <Image
                  src={option.image}
                  alt={option.title}
                  height={150}
                  width={150}
                />
                <div className={styles.divPrecio}>
                  <p className={styles.precioMes}>{option.monthlyPrice}</p>
                  <p className={styles.textMonth}>/Mensual</p>
                </div>
                <p className={styles.precioAnual}>{option.yearlyPrice}</p>
              </div>

              <div className={styles.cardBack}>
                <h4>Incluye:</h4>
                <ul>
                  {option.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className={
                        feature.available
                          ? styles.available
                          : styles.unavailable
                      }
                    >
                      {feature.available ? (
                        <span>✔</span>
                      ) : (
                        <span className={styles.unavailable}>✘</span>
                      )}
                      {feature.text}
                      {(feature as any).highlight && (
                        <span className="ml-1 inline-block bg-yellow-300 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                          Destacado
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {option.title === "Gratuito" ? (
              <div className={styles.selectContainer}>
                <button 
                  className={`${styles.button} m-4`}
                  onClick={handleFreePlan}
                >
                  {option.buttonLabel}
                </button>
              </div>
            ) : (
              option.priceId.monthly && (
                <div className={styles.selectContainer}>
                  <select
                    value={selectedPlans[index] ?? ""}
                    onChange={(e) =>
                      setSelectedPlans({
                        ...selectedPlans,
                        [index]: e.target.value,
                      })
                    }
                  >
                    <option value={option.priceId.monthly ?? ""}>
                      Mensual {option.monthlyPrice}
                    </option>
                    <option value={option.priceId.yearly ?? ""}>
                      Anual {option.yearlyPrice}
                    </option>
                  </select>

                  <button
                    className={`${styles.button} m-4`}
                    onClick={() => handleSubscribe(index, selectedPlans[index])}
                    disabled={isLoading[index]}
                  >
                    {isLoading[index] ? "Procesando..." : "Contratar"}
                  </button>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default ManagerSubscription; 