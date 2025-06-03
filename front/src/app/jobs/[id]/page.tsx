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
          {typeof offer.availabilityToTravel === "boolean" || offer.availabilityToTravel === "Si" || offer.availabilityToTravel === "No" ? (
            <p>
              <strong>Disponibilidad para viajar:</strong>{" "}
              {typeof offer.availabilityToTravel === "boolean" 
                ? (offer.availabilityToTravel ? "Sí" : "No")
                : offer.availabilityToTravel
              }
            </p>
          ) : null}
          {typeof offer.euPassport === "boolean" || offer.euPassport === "Si" || offer.euPassport === "No" ? (
            <p>
              <strong>Pasaporte UE:</strong>{" "}
              {typeof offer.euPassport === "boolean"
                ? (offer.euPassport ? "Sí" : "No")
                : offer.euPassport
              }
            </p>
          ) : null}
          {offer.salary && (
            <p>
              <strong>Salario:</strong> {offer.currencyType || ""} {offer.salary}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            <p className="opacity-80">Necesitas iniciar sesión y tener una suscripción para aplicar</p>
            <div className="flex gap-2 mt-2">
              <Link href="/Login" className="text-white underline hover:no-underline">
                Iniciar sesión
              </Link>
              <span>•</span>
              <Link href="/Subs" className="text-white underline hover:no-underline">
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
