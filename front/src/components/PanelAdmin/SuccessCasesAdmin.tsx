"use client";

import React, { useState, useEffect, useContext } from "react";
import { ISuccessCase } from "@/Interfaces/ISuccessCase";
import { 
  fetchAllSuccessCases, 
  createSuccessCase, 
  updateSuccessCase, 
  deleteSuccessCase,
  toggleSuccessCasePublish
} from "../Fetchs/SuccessCasesFetchs";
import { UserContext } from "../Context/UserContext";
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaPlus } from "react-icons/fa";

const SuccessCasesAdmin: React.FC = () => {
  const { token } = useContext(UserContext);
  const [successCases, setSuccessCases] = useState<ISuccessCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCase, setCurrentCase] = useState<ISuccessCase | null>(null);
  const [isNewCase, setIsNewCase] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Formulario
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formTestimonial, setFormTestimonial] = useState("");
  const [formImgUrl, setFormImgUrl] = useState("");
  const [formLongDescription, setFormLongDescription] = useState("");
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cargar casos de éxito al iniciar
  useEffect(() => {
    const loadSuccessCases = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const data = await fetchAllSuccessCases(token);
        if (Array.isArray(data)) {
          setSuccessCases(data);
        } else {
          setError("Formato de datos incorrecto");
        }
      } catch (err) {
        console.error("Error al cargar casos de éxito:", err);
        setError("No se pudieron cargar los casos de éxito");
      } finally {
        setLoading(false);
      }
    };

    loadSuccessCases();
  }, [token]);

  // Configurar el formulario para edición
  const handleEdit = (successCase: ISuccessCase) => {
    setCurrentCase(successCase);
    setFormName(successCase.name);
    setFormRole(successCase.role);
    setFormTestimonial(successCase.testimonial);
    setFormImgUrl(successCase.imgUrl);
    setFormLongDescription(successCase.longDescription || "");
    setFormIsPublished(successCase.isPublished !== false);
    setIsNewCase(false);
    setIsModalOpen(true);
    setFormError(null);
  };

  // Configurar el formulario para crear nuevo caso
  const handleNew = () => {
    setCurrentCase(null);
    setFormName("");
    setFormRole("");
    setFormTestimonial("");
    setFormImgUrl("");
    setFormLongDescription("");
    setFormIsPublished(true);
    setIsNewCase(true);
    setIsModalOpen(true);
    setFormError(null);
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formName || !formRole || !formTestimonial || !formImgUrl) {
      setFormError("Todos los campos marcados con * son obligatorios");
      return;
    }

    setIsUploading(true);
    setFormError(null);
    
    const caseData: ISuccessCase = {
      name: formName,
      role: formRole,
      testimonial: formTestimonial,
      imgUrl: formImgUrl,
      longDescription: formLongDescription,
      isPublished: formIsPublished
    };

    try {
      if (isNewCase) {
        // Crear nuevo caso de éxito
        const newCase = await createSuccessCase(token, caseData);
        setSuccessCases([...successCases, newCase]);
        setSuccessMessage("Caso de éxito creado correctamente");
      } else if (currentCase?.id) {
        // Actualizar caso existente
        const updatedCase = await updateSuccessCase(token, currentCase.id, caseData);
        setSuccessCases(
          successCases.map(c => c.id === currentCase.id ? updatedCase : c)
        );
        setSuccessMessage("Caso de éxito actualizado correctamente");
      }
      
      // Cerrar modal después de guardar
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error al guardar:", err);
      setFormError("Error al guardar: " + (err instanceof Error ? err.message : "desconocido"));
    } finally {
      setIsUploading(false);
    }
  };

  // Confirmar y eliminar un caso
  const handleDelete = async (id: string) => {
    if (!token) return;
    
    try {
      await deleteSuccessCase(token, id);
      setSuccessCases(successCases.filter(c => c.id !== id));
      setConfirmDelete(null);
      setSuccessMessage("Caso de éxito eliminado correctamente");
    } catch (err) {
      console.error("Error al eliminar:", err);
      setError("Error al eliminar el caso de éxito");
    }
  };

  // Cambiar estado de publicación
  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    if (!token) return;
    
    try {
      const newStatus = !currentStatus;
      await toggleSuccessCasePublish(token, id, newStatus);
      
      // Actualizar lista local
      setSuccessCases(
        successCases.map(c => c.id === id ? {...c, isPublished: newStatus} : c)
      );
      
      setSuccessMessage(`Caso de éxito ${newStatus ? "publicado" : "despublicado"} correctamente`);
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setError("Error al cambiar el estado de publicación");
    }
  };

  // Manejar cambio de imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Aquí se implementaría el código para subir la imagen a Cloudinary
    // Por ahora solo simulamos actualizar la URL
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    // Simular subida exitosa con URL temporal
    setFormImgUrl(URL.createObjectURL(file));
    
    // Aquí se integraría con el sistema de subida de archivos existente
  };

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Administración de Casos de Éxito</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1d5126]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administración de Casos de Éxito</h1>
        <button
          onClick={handleNew}
          className="bg-[#1d5126] text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Nuevo Caso
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {successCases.length > 0 ? (
          successCases.map((successCase) => (
            <div
              key={successCase.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden border ${
                successCase.isPublished !== false
                  ? "border-green-400"
                  : "border-gray-300"
              }`}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={successCase.imgUrl}
                  alt={successCase.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleTogglePublish(
                      successCase.id || '', 
                      successCase.isPublished !== false
                    )}
                    className={`p-2 rounded-full ${
                      successCase.isPublished !== false
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gray-500 hover:bg-gray-600"
                    } text-white`}
                    title={successCase.isPublished !== false ? "Despublicar" : "Publicar"}
                  >
                    {successCase.isPublished !== false ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <h2 className="font-bold text-lg text-[#1d5126] mb-1">{successCase.name}</h2>
                <p className="text-gray-600 text-sm mb-2">{successCase.role}</p>
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {successCase.testimonial}
                </p>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => handleEdit(successCase)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center text-sm"
                  >
                    <FaEdit className="mr-1" /> Editar
                  </button>
                  
                  {confirmDelete === successCase.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(successCase.id || '')}
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(successCase.id || '')}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center text-sm"
                    >
                      <FaTrash className="mr-1" /> Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center p-8 bg-gray-100 rounded-lg">
            <p className="text-gray-600">No hay casos de éxito disponibles.</p>
            <button
              onClick={handleNew}
              className="mt-4 bg-[#1d5126] text-white px-4 py-2 rounded-md"
            >
              Crear el primer caso
            </button>
          </div>
        )}
      </div>

      {/* Modal de edición/creación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {isNewCase ? "Nuevo Caso de Éxito" : "Editar Caso de Éxito"}
              </h2>
              
              {formError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {formError}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Nombre del protagonista"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Rol/Edad/Información *
                    </label>
                    <input
                      type="text"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Ej: Jugador de Fútbol, 24 años — Argentino"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Testimonio (cita breve) *
                  </label>
                  <textarea
                    value={formTestimonial}
                    onChange={(e) => setFormTestimonial(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Testimonio breve que aparecerá en la tarjeta"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Descripción completa
                  </label>
                  <textarea
                    value={formLongDescription}
                    onChange={(e) => setFormLongDescription(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Historia completa que se mostrará al hacer clic en 'Leer más'"
                    rows={6}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    URL de imagen *
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={formImgUrl}
                      onChange={(e) => setFormImgUrl(e.target.value)}
                      className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="URL de la imagen"
                      required
                    />
                    <label className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-r">
                      Subir
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  {formImgUrl && (
                    <div className="mt-2 w-full h-40 overflow-hidden rounded">
                      <img
                        src={formImgUrl}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formIsPublished}
                      onChange={(e) => setFormIsPublished(e.target.checked)}
                      className="mr-2"
                    />
                    <span>Publicar (visible para los usuarios)</span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                    disabled={isUploading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 bg-[#1d5126] text-white rounded-md hover:bg-[#3e7c27] flex items-center ${
                      isUploading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    disabled={isUploading}
                  >
                    {isUploading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    )}
                    {isUploading ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessCasesAdmin; 