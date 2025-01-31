import { IProfileData } from "@/Interfaces/IUser";

interface PhysicalDetailsProps {
  profileData: IProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<IProfileData>>;
}

const PhysicalDetails: React.FC<PhysicalDetailsProps> = ({ profileData, setProfileData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 border border-gray-300 shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold text-gray-700">Detalles Físicos</h2>
      <input
        type="number"
        name="height"
        value={profileData.height || ""}
        onChange={handleChange}
        placeholder="Altura (cm)"
        className="w-full p-2 border rounded mt-2 focus:outline-none hover:cursor-pointer text-gray-700"
      />
      <input
        type="number"
        name="weight"
        value={profileData.weight || ""}
        onChange={handleChange}
        placeholder="Peso (kg)"
        className="w-full p-2 border rounded mt-2 focus:outline-none hover:cursor-pointer text-gray-700"
      />
      <input
        type="text"
        name="bodyStructure"
        value={profileData.bodyStructure || ""}
        onChange={handleChange}
        placeholder="Contextura física ej. Atlético "
        className="w-full p-2 border rounded mt-2 focus:outline-none hover:cursor-pointer text-gray-700"
      />
    </div>
  );
};

export default PhysicalDetails;
