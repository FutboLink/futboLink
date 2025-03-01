export const Notifi: React.FC<{ message: string }> = ({ message }) => {
    console.log("Renderizando notificación con mensaje:", message); // Verifica en consola
  
    return (
      <div
        role="alert"
        className="text-gray-800 p-4 rounded-lg shadow-lg"
             >
        <p>{message}</p>
      </div>
    );
  };
  