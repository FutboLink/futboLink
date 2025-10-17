"use client";

import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { UserContext } from "../components/Context/UserContext";
import { requestVerification, showVerificationToast } from "../services/VerificationService";
import Head from "next/head";

export default function VerificationSuccess() {
  const router = useRouter();
  const { user, token } = useContext(UserContext);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationAttachment, setVerificationAttachment] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [loadingVerification, setLoadingVerification] = useState(false);

  // Función para manejar la subida de archivos
  const handleFileUpload = async (file: File): Promise<string> => {
    setUploadingAttachment(true);
    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return `placeholder://${file.name}`;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    } finally {
      setUploadingAttachment(false);
    }
  };

  // Función para solicitar verificación
  const handleRequestVerification = async () => {
    if (!user?.id || !token) {
      showVerificationToast.error("Debes iniciar sesión para solicitar verificación");
      return;
    }

    setLoadingVerification(true);
    const toastId = showVerificationToast.loading(
      "Enviando solicitud de verificación..."
    );

    try {
      let attachmentUrl: string | undefined;

      // Upload file if provided
      if (verificationAttachment) {
        try {
          attachmentUrl = await handleFileUpload(verificationAttachment);
        } catch (uploadError) {
          showVerificationToast.error(
            "Error al subir el archivo. Inténtalo de nuevo."
          );
          return;
        }
      }

      await requestVerification(
        user.id,
        {
          message: verificationMessage,
          attachmentUrl,
        },
        token
      );

      showVerificationToast.success(
        "¡Solicitud de verificación enviada exitosamente! Los administradores la revisarán pronto."
      );
      setVerificationMessage("");
      setVerificationAttachment(null);
      setShowVerificationModal(false);
      
      // Redirigir al perfil del usuario
      router.push(`/user-viewer/${user.id}`);
    } catch (error: unknown) {
      let errorMessage = "Error al enviar la solicitud de verificación";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      showVerificationToast.error(errorMessage);
    } finally {
      setLoadingVerification(false);
      if (toastId) {
        // showVerificationToast no tiene método dismiss, se maneja automáticamente
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Pago Exitoso - Verificación de Perfil - FutboLink</title>
        <meta name="description" content="Tu pago ha sido procesado exitosamente. Ahora puedes solicitar la verificación de tu perfil." />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Pago Exitoso!
            </h1>
            <p className="text-lg text-gray-600">
              Tu suscripción de verificación ha sido activada. Ahora puedes solicitar la verificación de tu perfil.
            </p>
          </div>

          {/* Benefits Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              ¿Qué incluye tu suscripción de verificación?
            </h2>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Insignia de verificado en tu perfil
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Apareces primero en las búsquedas
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Mayor credibilidad ante reclutadores
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Perfil más profesional y confiable
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowVerificationModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              type="button"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Solicitar Verificación Ahora
            </button>
            
            <button
              onClick={() => router.push(`/user-viewer/${user?.id}`)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              type="button"
            >
              Ver Mi Perfil
            </button>
          </div>

          {/* Verification Request Modal */}
          {showVerificationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <svg
                      className="w-6 h-6 mr-2 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Solicitar Verificación de Perfil
                  </h3>
                  <button
                    onClick={() => setShowVerificationModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    type="button"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Información sobre la verificación */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg
                        className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <h4 className="font-medium text-blue-800 mb-1">
                          ¡Ya tienes acceso a la verificación!
                        </h4>
                        <p className="text-sm text-blue-700">
                          Ahora puedes solicitar la verificación de tu perfil. Los administradores revisarán tu solicitud y te otorgarán el nivel de verificación correspondiente.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Formulario de solicitud */}
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="verificationMessage"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Mensaje para el administrador (opcional)
                      </label>
                      <textarea
                        value={verificationMessage}
                        id="verificationMessage"
                        onChange={(e) => setVerificationMessage(e.target.value)}
                        placeholder="Explica por qué solicitas la verificación de tu perfil. Por ejemplo: información sobre tu país, experiencia profesional, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={4}
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {verificationMessage.length}/500 caracteres
                      </p>
                    </div>

                    {/* File Upload Section */}
                    <div>
                      <label
                        htmlFor="verificationAttachment"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Adjuntar archivo de evidencia (opcional)
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="verificationAttachment"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              <span>Subir archivo</span>
                              <input
                                id="verificationAttachment"
                                name="verificationAttachment"
                                type="file"
                                className="sr-only"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setVerificationAttachment(file);
                                  }
                                }}
                              />
                            </label>
                            <p className="pl-1">o arrastra aquí</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PDF, DOC, DOCX, JPG, PNG hasta 10MB
                          </p>
                          {verificationAttachment && (
                            <div className="mt-2 flex items-center justify-center space-x-2">
                              <svg
                                className="h-5 w-5 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="text-sm text-green-700">
                                {verificationAttachment.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => setVerificationAttachment(null)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setShowVerificationModal(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                          type="button"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleRequestVerification}
                          type="button"
                          disabled={loadingVerification || uploadingAttachment}
                          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {loadingVerification || uploadingAttachment ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                              {uploadingAttachment
                                ? "Subiendo archivo..."
                                : "Enviando..."}
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                              >
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              Enviar Solicitud
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
