import Image from "next/image";
import React from "react";

interface CardProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const CardProfile: React.FC<CardProfileProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded shadow-lg max-w-4xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
        >
          ✖
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card
            title="Card 1"
            image="https://via.placeholder.com/400"
            paragraph="Descripción de la primera card. Personaliza este texto como prefieras."
          />
          <Card
            title="Card 2"
            image="https://via.placeholder.com/400"
            paragraph="Descripción de la segunda card. Este texto también es personalizable."
          />
        </div>
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  image: string;
  paragraph: string;
}

const Card: React.FC<CardProps> = ({ title, image, paragraph }) => {
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
      <Image src={image} alt={title} className="w-full h-48 object-cover rounded mb-4" />
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p>{paragraph}</p>
    </div>
  );
};

export default CardProfile;
