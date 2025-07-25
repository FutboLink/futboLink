"use client";

import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "@/components/Context/UserContext";
import {
  getAllVerificationRequests,
  processVerificationRequest,
  showVerificationToast,
  VerificationRequest,
} from "@/services/VerificationService";
import { FaCheck, FaTimes, FaUser, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const VerificationRequests: React.FC = () => {
  const { token } = useContext(UserContext);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [adminComments, setAdminComments] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED'>('APPROVED');

  // Cargar todas las solicitudes de verificación
  const loadVerificationRequests = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const allRequests = await getAllVerificationRequests(token);
      setRequests(allRequests);
    } catch (error) {
      console.error('Error al cargar solicitudes de verificación:', error);
      showVerificationToast.error('Error al cargar las solicitudes de verificación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerificationRequests();
  }, [token]);

  // Procesar solicitud de verificación
  const handleProcessRequest = async (requestId: string, status: 'APPROVED' | 'REJECTED', comments?: string) => {
    if (!token) return;

    setProcessingRequests(prev => new Set(prev).add(requestId));

    try {
      await processVerificationRequest(requestId, { status, adminComments: comments }, token);
      
      showVerificationToast.success(
        status === 'APPROVED' 
          ? 'Solicitud aprobada exitosamente' 
          : 'Solicitud rechazada'
      );
      
      // Recargar las solicitudes
      await loadVerificationRequests();
      
      // Cerrar modal si está abierto
      setShowModal(false);
      setSelectedRequest(null);
      setAdminComments("");
      
    } catch (error: any) {
      showVerificationToast.error(error.message || 'Error al procesar la solicitud');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Abrir modal para comentarios
  const openModal = (request: VerificationRequest, action: 'APPROVED' | 'REJECTED') => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminComments("");
    setShowModal(true);
  };

  // Filtrar solicitudes por estado
  const pendingRequests = requests.filter(req => req.status === 'PENDING');
  const processedRequests = requests.filter(req => req.status !== 'PENDING');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Solicitudes de Verificación</h2>
        <button
          onClick={loadVerificationRequests}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Actualizar
        </button>
      </div>

      {/* Solicitudes Pendientes */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaClock className="mr-2 text-orange-500" />
            Solicitudes Pendientes ({pendingRequests.length})
          </h3>
        </div>
        
        <div className="p-6">
          {pendingRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay solicitudes pendientes</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <FaUser className="mr-2 text-gray-500" />
                        <h4 className="font-semibold text-gray-800">
                          {request.player?.name} {request.player?.lastname}
                        </h4>
                        <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          Pendiente
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Email:</strong> {request.player?.email}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Fecha de solicitud:</strong> {new Date(request.createdAt).toLocaleDateString('es-ES')}
                      </p>
                      
                      {request.message && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Mensaje del jugador:</strong><br />
                            {request.message}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex flex-col space-y-2">
                      <button
                        onClick={() => openModal(request, 'APPROVED')}
                        disabled={processingRequests.has(request.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <FaCheck className="w-3 h-3" />
                        Aprobar
                      </button>
                      
                      <button
                        onClick={() => openModal(request, 'REJECTED')}
                        disabled={processingRequests.has(request.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <FaTimes className="w-3 h-3" />
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Solicitudes Procesadas */}
      {processedRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Solicitudes Procesadas ({processedRequests.length})
            </h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {processedRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <FaUser className="mr-2 text-gray-500" />
                        <h4 className="font-semibold text-gray-800">
                          {request.player?.name} {request.player?.lastname}
                        </h4>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                          request.status === 'APPROVED' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status === 'APPROVED' ? (
                            <>
                              <FaCheckCircle className="w-3 h-3" />
                              Aprobada
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className="w-3 h-3" />
                              Rechazada
                            </>
                          )}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Procesada:</strong> {new Date(request.updatedAt).toLocaleDateString('es-ES')}
                      </p>
                      
                      {request.adminComments && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Comentarios del administrador:</strong><br />
                            {request.adminComments}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal para comentarios */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {actionType === 'APPROVED' ? 'Aprobar' : 'Rechazar'} Solicitud
            </h3>
            
            <p className="text-gray-600 mb-4">
              Jugador: <strong>{selectedRequest.player?.name} {selectedRequest.player?.lastname}</strong>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios {actionType === 'REJECTED' ? '(requeridos)' : '(opcionales)'}
              </label>
              <textarea
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
                placeholder={
                  actionType === 'APPROVED' 
                    ? "Felicitaciones por la verificación de tu perfil..."
                    : "Explica los motivos del rechazo..."
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                maxLength={500}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleProcessRequest(selectedRequest.id, actionType, adminComments)}
                disabled={actionType === 'REJECTED' && !adminComments.trim()}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 ${
                  actionType === 'APPROVED' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionType === 'APPROVED' ? 'Aprobar' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationRequests; 