"use client";

import React, { useEffect } from "react";
import { Subscription } from "../../helpers/helpersSubs";
import AOS from "aos";
import "aos/dist/aos.css";
import FaqSection from "./faqSubs";
import Line from "../HorizontalDiv/line";

function Subs() {
  const subscriptionOptions = Subscription();

  useEffect(() => {
    if (typeof window !== "undefined") {
      AOS.init();
    }
  }, []);

  return (
    <section className="bg-gray-100 py-16 px-6">
      {/* Introducción */}
      <div
        className="text-center mb-12 sm:mb-16 bg-gradient-to-b from-green-500 to-green-700 text-white py-16 px-6"
        data-aos="fade-up"
        data-aos-duration="1000"
      >
        <h1 className="text-5xl font-bold mb-8 sm:mb-12">
          Descubre tu Mejor Oportunidad
        </h1>
        <p className="text-lg">
          Con nuestros planes de suscripción, accede a ofertas exclusivas y
          herramientas profesionales para tu carrera.
        </p>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 gap-24">
        {subscriptionOptions.map((option, index) => (
          <div
            key={index}
            className="card-container relative w-full h-auto min-h-[350px] mx-auto"
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            <div className="card relative w-full h-full rotate-0 transition-transform duration-500 transform-style-preserve-3d hover:rotate-y-180">
              <div
                className={`card-front p-6 flex flex-col items-center justify-center text-center border border-gray-300 rounded-lg shadow-lg ${
                  option.title === "GRATIS"
                    ? "bg-white text-gray-800"
                    : option.title === "BÁSICO"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                <h3 className="text-3xl font-semibold mb-4 text-gray-800">
                  {option.title}
                </h3>
                <p className="text-lg text-gray-600 mb-6">{option.subtitle}</p>
                <p className="text-2xl font-bold bg-green-500 rounded-xl text-white px-4 py-2">
                  {option.price}
                </p>
              </div>

              <div className="card-back bg-gradient-to-br from-green-600 to-green-400 text-white p-8 flex flex-col items-center justify-center text-center rounded-lg shadow-lg">
                <h4 className="text-2xl font-bold mb-6">Incluye:</h4>
                <ul className="space-y-3 text-lg">
                  {option.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className={`text-lg ${
                        feature.available
                          ? "text-white"
                          : "text-red-400 bg-white p-1 rounded-xl"
                      }`}
                    >
                      {feature.available ? "✔ " : "✘ "}
                      {feature.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-300">
                Contratar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <Line />
      </div>

      <FaqSection />
    </section>
  );
}

export default Subs;
