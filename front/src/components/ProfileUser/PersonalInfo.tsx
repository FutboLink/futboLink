import { IProfileData } from "@/Interfaces/IUser";

interface ProfessionalInfoProps {
  profileData: IProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<IProfileData>>;
}

const ProfessionalInfo: React.FC<ProfessionalInfoProps> = ({ profileData, setProfileData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 border border-gray-300 shadow-lg  rounded-lg ">
      <h2 className="text-lg text-gray-700 font-semibold">Información Personal</h2>

      {/* Nombre */}
      <input
        name="name"
        type="text"
        value={profileData.name}
        onChange={handleChange}
        placeholder="Nombre"
        required
        className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
      />

      {/* Apellido */}
      <input
        name="lastname"
        type="text"
        value={profileData.lastname}
        onChange={handleChange}
        placeholder="Apellido"
        required
        className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
      />

      {/* Email */}
      <input
        name="email"
        type="email"
        value={profileData.email}
        onChange={handleChange}
        placeholder="Correo electrónico"
        required
        className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
      />

      {/* Imagen de perfil (URL) */}
      <input
        name="imgUrl"
        type="text"
        value={profileData.imgUrl || ""}
        onChange={handleChange}
        placeholder="URL de la imagen (opcional)"
        className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
      />

      {/* Teléfono */}
      <input
        name="phone"
        type="text"
        value={profileData.phone || ""}
        onChange={handleChange}
        placeholder="Teléfono (opcional)"
        className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
      />

      {/* Nacionalidad */}
      <input
        name="nationality"
        type="text"
        value={profileData.nationality || ""}
        onChange={handleChange}
        placeholder="Nacionalidad (opcional)"
        className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
      />

      {/* Ubicación */}
      <input
        name="location"
        type="text"
        value={profileData.location || ""}
        onChange={handleChange}
        placeholder="Ubicación (opcional)"
        className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
      />

      {/* Género */}
      <select
        name="genre"
        value={profileData.genre || ""}
        onChange={handleChange}
        className="w-full p-2 border rounded mt-2 text-gray-400 hover:cursor-pointer focus:outline-none"
      >
        <option value="">Seleccione su género (opcional)</option>
        <option value="male">Masculino</option>
        <option value="female">Femenino</option>
        <option value="other">Otro</option>
      </select>

      {/* Fecha de nacimiento */}
      <input
        name="birthday"
        type="date"
        value={profileData.birthday || ""}
        onChange={handleChange}
        className="w-full p-2 border rounded mt-2 text-gray-400 hover:cursor-pointer focus:outline-none"
      />
    </div>
  );
};

export default ProfessionalInfo;
