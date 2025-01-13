import { IRegisterUser } from "@/Interfaces/IUser";

export const validationRegister = (userRegister: IRegisterUser) => {
  const errors: { name?: string; email?: string; password?: string; confirmPassword?: string;} = {};

  // Validar nombre
  if (!userRegister.name) {
    errors.name = "Debes ingresar un nombre";
  } else if (userRegister.name.length < 3 || userRegister.name.length > 50) {
    errors.name = "El nombre debe tener entre 3 y 50 caracteres";
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!userRegister.email) {
    errors.email = "Debes ingresar un correo electrónico";
  } else if (!emailRegex.test(userRegister.email)) {
    errors.email = "El correo electrónico no es válido";
  }

  // Validar contraseña
  const passwordRegex = /^.{8,}$/; 
  if (!userRegister.password) {
    errors.password = "Debes ingresar una contraseña";
  } else if (!passwordRegex.test(userRegister.password)) {
    errors.password =
     "La contraseña debe tener mínimo 8 caracteres";
  }




  return errors;
};