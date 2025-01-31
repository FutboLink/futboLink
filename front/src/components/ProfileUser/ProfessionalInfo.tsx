import { IProfileData } from "@/Interfaces/IUser";

interface ProfessionalInfoProps {
  profileData: IProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<IProfileData>>;
}

const ProfessionalInfo: React.FC<ProfessionalInfoProps> = ({ profileData, setProfileData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const habilities = e.target.value.split(",").map((skill) => skill.trim());
    setProfileData({ ...profileData, habilities });
  };

  return (
    <div className="p-4 border border-gray-300 shadow-lg rounded-lg ">
      <h2 className="text-lg text-gray-700 font-semibold">Información Profesional</h2>

      {/* Habilidades */}
      <input
        name="habilities"
        value={profileData.habilities?.join(", ") || ""}
        onChange={handleArrayChange}
        placeholder="Habilidades ej. (Tiro Libre, Velocidad)"
        className="w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none"
      />

      {/* Pie Hábil */}
      <label className="block mt-2 text-md text-gray-700 font-semibold">Pie Hábil</label>
      <select
        name="skillfulFoot"
        value={profileData.skillfulFoot || ""}
        onChange={handleChange}
        className="w-5/12 md:w-full  lg:w-full xl:w-full p-2 border rounded mt-1 text-gray-700 hover:cursor-pointer"
      >
        <option value="">Seleccione una opción</option>
        <option value="Derecho">Derecho</option>
        <option value="Izquierdo">Izquierdo</option>
        <option value="Ambos">Ambos</option>
      </select>
    </div>
  );
};

export default ProfessionalInfo;
