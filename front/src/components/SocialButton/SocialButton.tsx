import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";

function SocialButton() {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50">
      {/* WhatsApp Button */}
      <a
        href="https://wa.me/+393715851071"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-700 text-white rounded-full p-4 shadow-lg hover:text-green-700 hover:bg-white transition duration-300"
      >
        <FaWhatsapp size={24} className="sm:size-30" /> {/* WhatsApp icon */}
      </a>

      {/* Telegram Button */}
      <a
        href="https://t.me/futbolinkoficial"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white bg-blue-600 p-4 rounded-full shadow-lg hover:bg-white hover:text-blue-600 transition duration-300"
      >
        <FaTelegramPlane size={24} className="sm:size-30" />{" "}
        {/* Telegram icon */}
      </a>
    </div>
  );
}

export default SocialButton;
