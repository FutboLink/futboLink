import React, { useEffect, useState } from "react";
import PhoneInput, {
  isValidPhoneNumber,
  formatPhoneNumberIntl,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface EditableProps {
  mode: "edit";
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  defaultCountry?: string;
  validate?: boolean; // activa validación automática
}

interface ReadOnlyProps {
  mode: "view";
  value: string | undefined;
  showWhatsAppLink?: boolean;
  className?: string;
}

type PhoneNumberInputProps = EditableProps | ReadOnlyProps;

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = (props) => {
  if (props.mode === "edit") {
    const {
      value,
      onChange,
      label = "Número de teléfono",
      required = false,
      disabled = false,
      defaultCountry = "AR",
      validate = true,
    } = props;

    const [error, setError] = useState<string | null>(null);

    // Validar automáticamente al cambiar el valor
    useEffect(() => {
      if (!validate) return;

      if (required && !value) {
        setError("Este campo es obligatorio");
      } else if (value && !isValidPhoneNumber(value)) {
        setError("Número inválido");
      } else {
        setError(null);
      }
    }, [value, required, validate]);

    return (
      <div className="flex flex-col">
        {label && (
          <label className="mb-1 text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <PhoneInput
          international
          defaultCountry={defaultCountry as any}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`text-black border px-3 py-2 rounded focus:outline-none ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
        {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
      </div>
    );
  }

  // Vista solo lectura (modo "view")
  const { value, showWhatsAppLink = false, className = "" } = props;

  if (!value) {
    return <span className={className}>No disponible</span>;
  }

  const formatted = formatPhoneNumberIntl(value);
  const phoneDigits = value.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${phoneDigits}`;

  return (
    <span className={className}>
      {showWhatsAppLink ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-700 hover:underline"
        >
          {formatted}
        </a>
      ) : (
        formatted
      )}
    </span>
  );
};

export default PhoneNumberInput;
