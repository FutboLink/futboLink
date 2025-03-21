import Image from "next/image";
import Link from "next/link";
import foto from "../../../public/fotoprof.png";
import styles from "../../Styles/optionUser.module.css"; // Importa el módulo CSS

const RegistrationCards = () => {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Card Jugador */}
        <Link href="/OptionUsers/Player" className={styles.cardLink}>
          <div className={styles.card}>
            <Image
              src={foto}
              alt="Jugador"
              width={220}
              height={220}
              className={styles.image}
            />
            <h3 className={styles.title}>Jugadores y Profesionales</h3>
            <p className={styles.description}>
              Regístrate como jugador o profesional del mundo del deporte y
              comparte tus habilidades.
            </p>
          </div>
        </Link>

        {/* Card Representante */}
        <Link href="/OptionUsers/Manager" className={styles.cardLink}>
          <div className={styles.card}>
            <Image
              src="https://img.freepik.com/foto-gratis/joven-apuesto-hombre-negocios-ordenador-portatil-oficina_1303-21060.jpg"
              alt="Representante"
              width={220}
              height={220}
              className={styles.image}
            />
            <h3 className={styles.title}>Ofertante</h3>
            <p className={styles.description}>
              Publica puestos o encuentra jugadores para tus clientes con
              facilidad.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default RegistrationCards;
