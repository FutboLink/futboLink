import React, { useState } from 'react';

interface ContactFormProps {
  className?: string;
}

export default function ContactForm({ className = '' }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mensaje: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, mensaje } = formData;

    // Basic validation
    if (!name || !email || !mensaje) {
      setStatus('error');
      setErrorMessage('Por favor, completa todos los campos');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setErrorMessage('Por favor, introduce un correo electrónico válido');
      return;
    }

    try {
      setStatus('loading');
      
      // Use direct fetch instead of going through next.js API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://futbolink.onrender.com';
      const response = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', mensaje: '' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setStatus('error');
        setErrorMessage(errorData.message || 'Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error sending form:', error);
      setStatus('error');
      setErrorMessage('No se pudo conectar con el servidor');
    }
  };

  return (
    <div className={`bg-white p-6 sm:p-8 rounded-lg shadow-lg ${className}`}>
      <h2 className="text-2xl sm:text-3xl font-semibold text-verde-oscuro mb-6">
        Contáctanos
      </h2>
      
      <form onSubmit={handleSubmit} className="text-gray-800 space-y-4 sm:space-y-6">
        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-lg font-medium text-gray-700">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Tu nombre"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-oscuro"
            disabled={status === 'loading'}
          />
        </div>

        {/* Correo electrónico */}
        <div>
          <label htmlFor="email" className="block text-lg font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Tu correo electrónico"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-oscuro"
            disabled={status === 'loading'}
          />
        </div>

        {/* Mensaje */}
        <div>
          <label htmlFor="mensaje" className="block text-lg font-medium text-gray-700">
            Mensaje
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            rows={4}
            placeholder="Tu mensaje"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-oscuro"
            disabled={status === 'loading'}
          />
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          className="w-full py-3 bg-verde-oscuro text-white text-lg font-semibold rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </span>
          ) : "Enviar mensaje"}
        </button>
      </form>

      {/* Status messages */}
      {status === 'success' && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
          <p className="text-center text-md font-medium">✅ Mensaje enviado correctamente.</p>
          <p className="text-center text-sm mt-2">
            Te responderemos a la brevedad a la dirección de correo proporcionada.
          </p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
          <p className="text-center text-md font-medium">❌ {errorMessage}</p>
        </div>
      )}
    </div>
  );
} 