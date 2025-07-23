"use client";
import React, { useContext, useEffect, useState } from "react";
import { IOfferCard } from "@/Interfaces/IOffer";
import { getOfertas } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch";
import { UserContext } from "@/components/Context/UserContext";
import EditOffer from "./EditOffer";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import Link from "next/link";

const ManageOffers: React.FC = () => {
  const [offers, setOffers] = useState<IOfferCard[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<IOfferCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingOffer, setEditingOffer] = useState<IOfferCard | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [offerToDelete, setOfferToDelete] = useState<IOfferCard | null>(null);
  const { token } = useContext(UserContext);

  // Opciones de filtrado
  const contractTypes = [
    "Contrato Profesional",
    "Semiprofesional", 
    "Amateur",
    "Contrato de cesión",
    "Prueba",
  ];

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    let filtered = offers;

    if (searchTerm) {
      filtered = filtered.filter((offer) => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
          offer.title?.toLowerCase().includes(lowerSearchTerm) ||
          offer.location?.toLowerCase().includes(lowerSearchTerm) ||
          offer.position?.toLowerCase().includes(lowerSearchTerm) ||
          offer.contractTypes?.toLowerCase().includes(lowerSearchTerm)
        );
      });
    }

    setFilteredOffers(filtered);
  }, [searchTerm, offers]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await getOfertas();
      setOffers(data);
      setFilteredOffers(data);
    } catch (error) {
      console.error("Error al cargar ofertas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOffer = (offer: IOfferCard) => {
    setEditingOffer(offer);
  };

  const handleSaveOffer = async (updatedOffer: IOfferCard) => {
    // Actualizar la lista de ofertas
    setOffers(prev => 
      prev.map(offer => 
        offer.id === updatedOffer.id ? updatedOffer : offer
      )
    );
    setEditingOffer(null);
    await fetchOffers(); // Recargar para obtener datos actualizados
  };

  const handleCancelEdit = () => {
    setEditingOffer(null);
  };

  const handleDeleteOffer = (offer: IOfferCard) => {
    setOfferToDelete(offer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!offerToDelete || !token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/jobs/${offerToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setOffers(prev => prev.filter(offer => offer.id !== offerToDelete.id));
        setShowDeleteModal(false);
        setOfferToDelete(null);
      } else {
        console.error("Error al eliminar la oferta");
      }
    } catch (error) {
      console.error("Error al eliminar la oferta:", error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setOfferToDelete(null);
  };

  const sortedOffers = filteredOffers.slice().sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (editingOffer) {
    return (
      <EditOffer
        offer={editingOffer}
        onSave={handleSaveOffer}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Ofertas</h2>
        <span className="text-sm text-gray-600">
          Total: {filteredOffers.length} ofertas
        </span>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por título, ubicación, posición o tipo de contrato..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-400"></div>
        </div>
      ) : (
        <>
          {/* Tabla de ofertas */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oferta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedOffers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={offer.imgUrl || "/cursosYFormaciones.JPG"}
                              alt={offer.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {offer.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {offer.position}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{offer.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {offer.contractTypes}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {offer.currencyType}{offer.salary}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/jobs/${offer.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalles"
                          >
                            <FaEye />
                          </Link>
                          <button
                            onClick={() => handleEditOffer(offer)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {sortedOffers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No se encontraron ofertas.</p>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              ¿Estás seguro de que quieres eliminar la oferta "{offerToDelete?.title}"? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOffers; 