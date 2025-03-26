"use client";

import React, { useEffect, useState } from "react";
import { Subscription } from "../../helpers/helpersSubs";
import AOS from "aos";
import "aos/dist/aos.css";
import FaqSection from "./faqSubs";
import Line from "../HorizontalDiv/line";
import styles from "../../Styles/cardSub.module.css";
import Image from "next/image";

function Subs() {
  const subscriptionOptions = Subscription();

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

  const handleSubscribe = async (priceId: string) => {
    if (!priceId) return;

    try {
      const response = await fetch(
        "http://localhost:3000/payment/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ priceId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { sessionUrl } = await response.json();
      window.location.href = sessionUrl;
    } catch (error) {
      console.error("Error al crear la sesión de pago:", error);
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
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mostrar solo el botón si el plan no es "Amateur" */}
            {option.priceId.monthly && (
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
                    Mensual ({option.monthlyPrice})
                  </option>
                  <option value={option.priceId.yearly ?? ""}>
                    Anual ({option.yearlyPrice})
                  </option>
                </select>

                <button
                  className={`${styles.button} m-4`}
                  onClick={() => handleSubscribe(selectedPlans[index])}
                >
                  {option.title === "Amateur"
                    ? "Registrate Gratis"
                    : "Contratar"}
                </button>
              </div>
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
