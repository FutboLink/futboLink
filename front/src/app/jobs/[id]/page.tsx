"use client";
import React, { useState, useEffect, useContext } from "react";
import { IOfferCard } from "@/Interfaces/IOffer";
import { UserContext } from "@/components/Context/UserContext";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ModalApplication from "@/components/Applications/ModalApplications";
import { checkUserSubscription } from "@/services/SubscriptionService";

const JobDetail: React.FC = () => {
  const params = useParams();
  const [offer, setOffer] = useState<IOfferCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isToken, setIsTokene] = useState(false);
  const [isOffer, setIsOffer] = useState<IOfferCard>();
  const { token, user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  // Use environment variable directly
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (params && params.id) {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      setJobId(id);
    }
  }, [params]);

  useEffect(() => {
    // Check subscription status when user data is available
    const checkSubscription = async () => {
      if (user && user.email && token) {
        setCheckingSubscription(true);
        try {
          const subData = await checkUserSubscription(user.email);
          setHasActiveSubscription(subData.hasActiveSubscription);
          console.log("Subscription status checked:", subData);
        } catch (error) {
          console.error("Error checking subscription:", error);
        } finally {
          setCheckingSubscription(false);
        }
      }
    };

    checkSubscription();
  }, [user, token]);

  const decodeToken = (token: string) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace("-", "+").replace("_", "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );

    return JSON.parse(jsonPayload);
  };

  const userId = token ? decodeToken(token).id : null;

  useEffect(() => {
    const fetchOffer = async () => {
      if (jobId) {
        try {
          setIsLoading(true);
          // Use direct API URL to bypass rewrites
          const response = await fetch(`${apiUrl}/jobs/${jobId}`);

          if (!response.ok) {
            console.error("Error fetching job details:", await response.text());
            throw new Error("Failed to fetch job details");
          }

          const fetchedOffer = await response.json();
          setOffer(fetchedOffer);
        } catch (error) {
          console.error("Error al obtener la oferta:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOffer();
  }, [jobId, apiUrl]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="p-6 text-center mt-24">
        <h1 className="text-2xl font-bold text-red-600">
          Oferta no encontrada
        </h1>
        <p className="mt-2">
          Lo sentimos, no pudimos encontrar la oferta que buscabas.
        </p>
        <Link href="/jobs">
          <button className="">Volver</button>
        </Link>
      </div>
    );
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleApplyClick = (offer: IOfferCard) => {
    setIsOffer(offer);

    if (!token) {
      setIsModalOpen(true);
      setIsTokene(true);
      return;
    }

    setIsModalOpen(true);
    setIsTokene(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 justify-center items-start mt-20 text-gray-800 bg-[#f5f5f5] p-4 rounded-md">
      {/* Card Principal */}
      <div className="flex-1 w-full min-w-0 rounded-xl shadow-md p-6 bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          {offer.imgUrl && (
            <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden shadow-md">
              <Image
                width={100}
                height={100}
                src={offer.imgUrl || "/cursosYFormaciones.JPG"}
                alt={offer.title}
                className="w-full h-full object-contain rounded-md"
              />
            </div>
          )}
          {offer.title && (
            <h1 className="text-xl font-semibold text-[#1d5126]">
              {offer.title}
            </h1>
          )}
        </div>

        {offer.position && (
          <h1 className="text-lg sm:text-xl font-semibold text-white p-1 rounded w-fit px-3 text-center bg-[#1d5126]">
            {offer.position}
          </h1>
        )}

        {offer.description && (
          <>
            <h2 className="text-lg font-semibold text-verde-oscuro mt-4 mb-2">
              Descripción de la oferta
            </h2>
            <p className="text-gray-700 mb-4 whitespace-pre-line">
              {offer.description}
            </p>
          </>
        )}

        {/* Requisitos */}
        <h2 className="text-lg font-semibold text-verde-oscuro mt-4 mb-2">
          Requisitos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-gray-700">
          {offer.minExperience && (
            <p>
              <strong>Experiencia mínima:</strong> {offer.minExperience}
            </p>
          )}
          {(offer.minAge || offer.maxAge) && (
            <p>
              <strong>Edad:</strong> {offer.minAge} - {offer.maxAge} años
            </p>
          )}
          {offer.sport && (
            <p>
              <strong>Modalidad:</strong> {offer.sport}
            </p>
          )}
          {offer.sportGenres && (
            <p>
              <strong>Género:</strong> {offer.sportGenres}
            </p>
          )}
          {typeof offer.availabilityToTravel === "boolean" ||
          offer.availabilityToTravel === "Si" ||
          offer.availabilityToTravel === "No" ? (
            <p>
              <strong>Disponibilidad para viajar:</strong>{" "}
              {typeof offer.availabilityToTravel === "boolean"
                ? offer.availabilityToTravel
                  ? "Sí"
                  : "No"
                : offer.availabilityToTravel}
            </p>
          ) : null}
          {typeof offer.euPassport === "boolean" ||
          offer.euPassport === "Si" ||
          offer.euPassport === "No" ? (
            <p>
              <strong>Pasaporte UE:</strong>{" "}
              {typeof offer.euPassport === "boolean"
                ? offer.euPassport
                  ? "Sí"
                  : "No"
                : offer.euPassport}
            </p>
          ) : null}
          {offer.salary && (
            <p>
              <strong>Salario:</strong> {offer.currencyType || ""}{" "}
              {offer.salary}
            </p>
          )}
          {offer.createdAt && (
            <p>
              <strong>Fecha de publicación:</strong>{" "}
              {new Date(offer.createdAt).toLocaleDateString()}
            </p>
          )}

          {/* Display countries if available, otherwise use nationality */}
          {Array.isArray(offer.countries) && offer.countries.length > 0 ? (
            <p>
              <strong>Países:</strong> {offer.countries.join(", ")}
            </p>
          ) : offer.nationality ? (
            <p>
              <strong>Nacionalidad:</strong> {offer.nationality}
            </p>
          ) : null}

          {Array.isArray(offer.extra) && offer.extra.length > 0 && (
            <div className="col-span-full">
              <p className="font-semibold mb-1">
                <strong>Extras incluidos:</strong>
              </p>
              <ul className="list-disc ml-6 text-sm text-gray-600 space-y-1">
                {offer.extra.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Compartir esta oferta */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-3">Compartir esta oferta:</p>
          <div className="flex space-x-4">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `¡Mira esta oferta en FutboLink!: ${offer.title} - ${window.location.href}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartir en WhatsApp"
              className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </a>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-8 mb-2">
          *FutboLink no es responsable por las ofertas publicadas por terceros.
          Si notás algo fuera de lo normal o sospechoso, podés contactarnos para
          revisarlo.
        </p>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 bg-gradient-to-r from-[#1d5126] to-[#3e7c27] text-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-2">Información adicional</h2>

        {offer.position && (
          <p className="mb-1">
            <strong>Puesto:</strong> {offer.position}
          </p>
        )}
        {offer.location && (
          <p className="mb-1">
            <strong>Ubicación:</strong> {offer.location}
          </p>
        )}
        {offer.contractTypes && (
          <p className="mb-4">
            <strong>Tipo de contrato:</strong> {offer.contractTypes}
          </p>
        )}
        {offer.contractDurations && (
          <p className="mb-4">
            <strong>Tiempo de contrato:</strong> {offer.contractDurations}
          </p>
        )}

        {/* Subscription status information */}
        {token && (
          <div className="mb-4 text-sm">
            {checkingSubscription ? (
              <p className="text-white opacity-90 bg-[#ffffff20] p-2 rounded-md">
                Verificando suscripción...
              </p>
            ) : hasActiveSubscription ? (
              <p className="text-white bg-[#ffffff20] p-2 rounded-md flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Suscripción activa
              </p>
            ) : (
              <p className="text-white bg-[#ffffff20] p-2 rounded-md flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Se requiere suscripción para aplicar
              </p>
            )}
          </div>
        )}

        <button
          onClick={() => handleApplyClick(offer)}
          className="mt-2 w-full py-2 rounded-lg font-bold border-2 border-white bg-white text-gray-700 hover:bg-transparent hover:text-white transition"
        >
          Aplicar a esta oferta
        </button>

        <Link href="/jobs">
          <button className="mt-4 w-full py-2 rounded-lg font-bold border-2 border-white text-white hover:bg-white hover:text-gray-700 transition">
            Volver
          </button>
        </Link>

        {!token && (
          <div className="mt-4 text-center text-sm">
            <p className="opacity-80">
              Necesitas iniciar sesión y tener una suscripción para aplicar
            </p>
            <div className="flex gap-2 mt-2">
              <Link
                href="/Login"
                className="text-white underline hover:no-underline"
              >
                Iniciar sesión
              </Link>
              <span>•</span>
              <Link
                href="/Subs"
                className="text-white underline hover:no-underline"
              >
                Ver suscripciones
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && userId && offer.id && (
        <ModalApplication
          jobId={offer.id.toString()}
          userId={userId.toString()}
          jobTitle={offer.title}
          onClose={handleCloseModal}
          isOffer={isOffer}
          typeMessage={isToken}
        />
      )}
    </div>
  );
};

export default JobDetail;
