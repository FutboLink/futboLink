"use client";
import React, { useState, useEffect, useContext } from "react";
import { IOfferCard } from "@/Interfaces/IOffer";
import { getOfertaById } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch";
import ModalApplication from "@/components/Applications/ModalApplications";
import Link from "next/link";
import { useParams } from "next/navigation";
import { UserContext } from "@/components/Context/UserContext";
import styles from "../../../Styles/jobDetail.module.css"; // Importa los estilos mejorados

const JobDetail: React.FC = () => {
  const params = useParams();
  const [offer, setOffer] = useState<IOfferCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const { token } = useContext(UserContext);

  useEffect(() => {
    if (params && params.id) {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      setJobId(id);
    }
  }, [params]);

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
        const fetchedOffer = await getOfertaById(jobId);
        setOffer(fetchedOffer);
      }
    };

    fetchOffer();
  }, [jobId]);

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
          <button className={`${styles.button} ${styles.backButton}`}>
            Volver
          </button>
        </Link>
      </div>
    );
  }

  const handleApplyClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.container}>
      {/* 🔹 Tarjeta principal */}
      <div className={styles.card}>
        <h1 className={styles.title}>{offer.position}</h1>

        {/* 🔹 Descripción de la oferta */}
        <h2 className={styles.subtitle}>Descripción de la oferta</h2>
        <p className={styles.description}>
          {offer.description || "No hay descripción disponible."}
        </p>

        <h2 className={styles.subtitle}>Requisitos</h2>
        <ul className={styles.list}>
          <li>
            <strong>Deporte:</strong> {offer.sportGenres}
          </li>
          <li>
            <strong>Disponibilidad para viajar:</strong>{" "}
            {offer.availabilityToTravel ? "Sí" : "No"}
          </li>
          <li>
            <strong>Pasaporte UE:</strong> {offer.euPassport ? "Sí" : "No"}
          </li>
          <li>
            <strong>Edad:</strong> {offer.minAge} - {offer.maxAge} años
          </li>
          <li>
            <strong>Salario:</strong> ${offer.salary || "No especificado"}
          </li>
          <li>
            <strong>Tipo:</strong> {offer.type}
          </li>
          <li>
            <strong>Fecha de publicación:</strong> {offer.createdAt}
          </li>
        </ul>
      </div>

      {/* 🔹 Tarjeta lateral */}
      <div className={styles.sidebar}>
        <h2 className={styles.subtitle}>Información adicional</h2>
        <p className={styles.info}>
          <strong>Puesto:</strong> {offer.position}
        </p>
        <p className={styles.info}>
          <strong>Ubicación:</strong> {offer.location}
        </p>
        <p className={styles.info}>
          <strong>Tipo de contrato:</strong> {offer.contractTypes}
        </p>

        {/* Botones */}
        <button
          className={`${styles.button} ${styles.applyButton}`}
          onClick={handleApplyClick}
        >
          Aplicar a esta oferta
        </button>

        <Link href="/jobs">
          <button className={`${styles.button} ${styles.backButton}`}>
            Volver
          </button>
        </Link>
      </div>

      {/* Modal */}
      {isModalOpen && userId && jobId && (
        <ModalApplication
          jobId={jobId}
          userId={userId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default JobDetail;
