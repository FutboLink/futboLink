import React from "react";
import { IOfferCard } from "@/Interfaces/IOffer";
import Image from "next/image";
import Link from "next/link";
import styles from "../../../Styles/cardOffer.module.css";

const CardOffer: React.FC<{ offer: IOfferCard }> = ({ offer }) => {
  return (
    <div className={styles.cardContainer}>
      {/* Encabezado con imagen y título */}
      <div className={styles.cardHeader}>
        <div className={styles.imageContainer}>
          <Image
            width={100}
            height={100}
            src={offer.imgUrl || "/cursosYFormaciones.JPG"}
            alt={offer.title}
            className={styles.image}
          />
        </div>
        <div>
          <h3 className={styles.title}>{offer.title}</h3>
          {/* Descripción debajo del título */}
          <div className={styles.description}>
            <p>{offer.description}</p>
          </div>
        </div>
      </div>

      {/* Contenido en dos columnas */}
      <div className={styles.cardContent}>
        <div>
          <p>
            <span className={styles.bold}>Posición:</span> {offer.position}
          </p>
          <p>
            <span className={styles.bold}>Nacionalidad:</span>{" "}
            {offer.nationality}
          </p>
          <p>
            <span className={styles.bold}>Categoría:</span> {offer.category}
          </p>
          <p>
            <span className={styles.bold}>Tipo de contrato:</span>{" "}
            {offer.contractTypes}
          </p>
        </div>
        <div>
          <p>
            <span className={styles.bold}>Edad:</span> {offer.minAge} -{" "}
            {offer.maxAge}
          </p>
          <p>
            <span className={styles.bold}>Viajes:</span>{" "}
            {offer.availabilityToTravel ? "Sí" : "No"}
          </p>
          <p>
            <span className={styles.bold}>Pasaporte UE:</span>{" "}
            {offer.euPassport ? "Sí" : "No"}
          </p>
        </div>
      </div>

      {/* Salario */}
      <div className={styles.salary}>Salario: ${offer.salary}</div>

      {/* Acciones */}
      <div className={styles.cardActions}>
        <Link
          href={`/jobs/${offer.id}`}
          className={`${styles.button} ${styles.detailsButton}`}
        >
          Ver más
        </Link>
        <Link
          href={`/jobs/${offer.id}`}
          className={`${styles.button} ${styles.applyButton}`}
        >
          Aplicar
        </Link>
      </div>
    </div>
  );
};

export default CardOffer;
