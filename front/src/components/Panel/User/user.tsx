import Image from "next/image";
import userH from "@/helpers/helperUser";

const UserProfile: React.FC = () => {
  const user = userH;

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          {/* Perfil */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 flex justify-center md:justify-start">
              <Image
                src={user.profilePicture}
                alt="Profile"
                width={100}
                height={100}
                className="w-40 h-40 rounded-full object-cover border-4 border-gray-300"
              />
            </div>
            <div className="col-span-2">
              <h2 className="text-2xl font-bold text-gray-800">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600">{user.role}</p>
              <p className="text-gray-600">{user.phone}</p>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-gray-600">{user.nationality}</p>
              <p className="text-gray-600">{user.location}</p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CV y documento extra */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700">
                Documentos
              </h3>
              <a
                href={user.cv}
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                CV
              </a>
              <a
                href={user.additionalDocument}
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                Documento extra
              </a>
            </div>

            {/* Video de presentación */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700">
                Video de presentación
              </h3>
              <iframe
                width="100%"
                height="315"
                src={user.presentationVideo}
                title="Video de presentación"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Habilidades */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-700">Habilidades</h3>
            <div className="space-y-2">
              {user.skills.map((skill, index) => (
                <div key={index} className="flex items-center">
                  <span className="font-medium text-gray-800">
                    {skill.skill}
                  </span>
                  <span className="ml-2 text-gray-600">{skill.level}</span>
                  <span className="ml-2 text-gray-600">
                    ({skill.frequency})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-700">
              Redes Sociales
            </h3>
            <div className="space-y-2">
              {Object.entries(user.socialLinks).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <span className="font-medium text-gray-800 capitalize">
                    {key}:
                  </span>
                  <a
                    href={value}
                    target="_blank"
                    className="ml-2 text-blue-500 hover:underline"
                  >
                    {value}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Trayectoria */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-700">Trayectoria</h3>
            <div className="space-y-4">
              {user.career.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg shadow-md"
                >
                  <h4 className="font-bold text-gray-800">{item.club}</h4>
                  <p className="text-gray-600">{item.position}</p>
                  <p className="text-gray-600">
                    {item.startDate} - {item.endDate}
                  </p>
                  <p className="text-gray-600">{item.category}</p>
                  <p className="text-gray-600">{item.competitionLevel}</p>
                  <p className="text-gray-600">{item.achievements}</p>
                  <p className="text-gray-600">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Educación */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-700">
              Formación Académica
            </h3>
            <div className="space-y-4">
              {user.education.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg shadow-md"
                >
                  <h4 className="font-bold text-gray-800">{item.degree}</h4>
                  <p className="text-gray-600">{item.institution}</p>
                  <p className="text-gray-600">
                    {item.startDate} - {item.endDate}
                  </p>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
