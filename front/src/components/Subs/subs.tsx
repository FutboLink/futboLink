"use client";

import React, { useEffect, useState } from "react";
import { Subscription } from "../../helpers/helpersSubs";
import AOS from "aos";
import "aos/dist/aos.css";
import FaqSection from "./faqSubs";
import Line from "../HorizontalDiv/line";
import styles from "../../Styles/cardSub.module.css";
import Image from "next/image";
import Link from "next/link";

function Subs() {
  const subscriptionOptions = Subscription();
  const [isLoading, setIsLoading] = useState<{ [key: number]: boolean }>({});
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (typeof window !== "undefined") {
      AOS.init();
    }
  }, []);

  // Estado de selección de plan
  const [selectedPlans, setSelectedPlans] = useState<{ [key: number]: string }>(
    () =>
      subscriptionOptions.reduce((acc, _, index) => {
        acc[index] = subscriptionOptions[index].priceId.monthly ?? "";
        return acc;
      }, {} as { [key: number]: string })
  );

  const handleSubscribe = async (index: number, priceId: string) => {
    if (!priceId) return;
    
    setIsLoading({ ...isLoading, [index]: true });

    try {
      // Get the user email from local storage or context
      const userEmail = localStorage.getItem('userEmail') || 'usuario@example.com';
      
      // Get the product ID if available
      const option = subscriptionOptions[index];
      const productId = option.productId;
      
      console.log(`Creating subscription with price ID: ${priceId}`);
      if (productId) {
        console.log(`Using product ID: ${productId}`);
      }
      console.log(`API URL: ${apiUrl}/payments/subscription`);
      
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
            // Asegurar que el plan esté siempre incluido en la URL
            successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(userEmail)}&plan=${encodeURIComponent(option.title)}`, 
            cancelUrl: `${window.location.origin}/payment/cancel`,
            description: "Suscripción a FutboLink",
            ...(productId && { productId }), // Solo incluir productId si existe
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

  return (
    <section className={styles.section}>
      <div className={styles.intro} data-aos="fade-up" data-aos-duration="1000">
        <h1>Descubre tu Mejor Oportunidad</h1>
        <p>
          Con nuestros planes de suscripción, accede a ofertas exclusivas y
          herramientas profesionales para tu carrera.
        </p>
      </div>

      <div className={styles.grid}>
        {subscriptionOptions.map((option, index) => (
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
                      {feature.highlight && (
                        <span className="ml-1 inline-block bg-yellow-300 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                          Destacado
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {option.title === "Amateur" ? (
  <div className={styles.selectContainer}>
    {/* Select vacío o bloqueado para mantener la altura */}
    <select disabled className={styles.disabledSelect}>
      <option>Registrate Gratis</option>
    </select>

    <Link href="/OptionUsers">
      <button className={`${styles.button} m-4`}>
        Registrarse
      </button>
    </Link>
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

      <div className={styles.line}>
        <Line />
      </div>

      <FaqSection />
    </section>
  );
}

export default Subs;
