import { ILoginUser } from "@/Interfaces/IUser";

export const validationLogin = (user: ILoginUser) => {
    const errors: { email?: string; password?: string } = {};
    let formIsValid = true;


  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!user.email) {
    errors.email = "Debes ingresar un correo electrónico";
    formIsValid = false;
  } else if (!emailRegex.test(user.email)) {
    errors.email = "El correo electrónico no es válido";
    formIsValid = false;
  }

 
const passwordRegex = /^.{8,}$/; 

if (!user.password) {
  errors.password = "Debes ingresar una contraseña";
  formIsValid = false;
} else if (!passwordRegex.test(user.password)) {
  errors.password = "La contraseña debe tener mínimo 8 caracteres";
  formIsValid = false;
}



 
  return { formIsValid, errors };
};