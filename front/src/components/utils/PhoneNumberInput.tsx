import React, { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import PhoneInput, {
  isValidPhoneNumber,
  formatPhoneNumberIntl,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface EditableProps {
  mode: "edit";
  name: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  defaultCountry?: string;
  validate?: boolean;
}

interface ReadOnlyProps {
  mode: "view";
  value: string | undefined;
  showWhatsAppLink?: boolean;
  className?: string;
}

type PhoneNumberInputProps = EditableProps | ReadOnlyProps;

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = (props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  if (props.mode === "edit") {
    const {
      name,
      value,
      onChange,
      label = "Teléfono",
      required = false,
      disabled = false,
      defaultCountry = "US",
      validate = true,
    } = props;

    const [error, setError] = useState<string | null>(null);

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

    const handleInternalChange = (val: string | undefined) => {
      if (!inputRef.current) return;

      const nativeInput = inputRef.current;
      nativeInput.value = val || "";

      const event = new Event("input", { bubbles: true });
      Object.defineProperty(event, "target", {
        writable: false,
        value: nativeInput,
      });

      nativeInput.name = name;
      onChange(event as unknown as React.ChangeEvent<HTMLInputElement>);
    };

    return (
      <div className="flex flex-col">
        {label && (
          <label
            htmlFor={name}
            className="text-gray-700 font-semibold text-sm mt-2"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        {/* Campo oculto para engancharse al onChange tradicional */}
        <input
          ref={inputRef}
          type="hidden"
          name={name}
          value={value || ""}
          readOnly
        />
        <PhoneInput
          id={name}
          international
          defaultCountry={defaultCountry as any}
          value={value}
          onChange={handleInternalChange}
          disabled={disabled}
          className={`w-full p-2 border rounded mt-2 text-gray-700 hover:cursor-pointer focus:outline-none gap-2 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
        {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
      </div>
    );
  }

  // Modo solo lectura
  const { value, showWhatsAppLink = false, className = "" } = props;

  if (!value) {
    return <span className={className}>No disponible</span>;
  }

  const formatted = formatPhoneNumberIntl(value);
  const phoneDigits = value.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${phoneDigits}`;

  return showWhatsAppLink ? (
    <span className={`flex items-center gap-2 ${className}`}>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-green-700 hover:underline"
      >
        {formatted}
        <FaWhatsapp className="text-green-600" />
      </a>
    </span>
  ) : (
    <span className={className}>{formatted}</span>
  );
};

export default PhoneNumberInput;
